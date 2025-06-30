#!/usr/bin/env python3
"""
Pfluger Architects Portfolio Scraper

This script scrapes the Pfluger Architects portfolio website to extract:
- Project names
- Project images
- Project details (location, market, jurisdiction, etc.)

The script downloads images and saves project data to structured files.
"""

import os
import re
import json
import csv
import time
import requests
from urllib.parse import urljoin, urlparse
from pathlib import Path
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from PIL import Image
import io

class PflugerScraper:
    def __init__(self, base_url="https://pflugerarchitects.com/portfolio/"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.projects = []
        self.images_dir = Path("images")
        self.images_dir.mkdir(exist_ok=True)
        
        # Setup Selenium WebDriver
        self.setup_driver()
    
    def setup_driver(self):
        """Setup Chrome WebDriver with appropriate options"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Run in background
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
    
    def get_page_content(self):
        """Load the portfolio page and get its content"""
        print(f"Loading portfolio page: {self.base_url}")
        
        try:
            self.driver.get(self.base_url)
            
            # Wait for the page to load completely
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "portfolio-item"))
            )
            
            # Scroll to load any lazy-loaded content
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            return self.driver.page_source
            
        except Exception as e:
            print(f"Error loading page with Selenium: {e}")
            # Fallback to requests
            response = self.session.get(self.base_url)
            response.raise_for_status()
            return response.text
    
    def clean_filename(self, filename):
        """Clean filename for safe file system storage"""
        # Remove or replace invalid characters
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        filename = re.sub(r'\s+', '_', filename)
        filename = filename.strip('._')
        return filename[:100]  # Limit length
    
    def download_image(self, img_url, project_name, img_index=0):
        """Download and save project image"""
        try:
            # Make URL absolute
            if not img_url.startswith('http'):
                img_url = urljoin(self.base_url, img_url)
            
            print(f"Downloading image: {img_url}")
            
            response = self.session.get(img_url, timeout=30)
            response.raise_for_status()
            
            # Get file extension from URL or content type
            parsed_url = urlparse(img_url)
            ext = os.path.splitext(parsed_url.path)[1]
            if not ext:
                content_type = response.headers.get('content-type', '')
                if 'jpeg' in content_type or 'jpg' in content_type:
                    ext = '.jpg'
                elif 'png' in content_type:
                    ext = '.png'
                elif 'webp' in content_type:
                    ext = '.webp'
                else:
                    ext = '.jpg'  # Default
            
            # Create filename
            clean_name = self.clean_filename(project_name)
            if img_index > 0:
                filename = f"{clean_name}_{img_index}{ext}"
            else:
                filename = f"{clean_name}{ext}"
            
            filepath = self.images_dir / filename
            
            # Save image
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"Saved image: {filepath}")
            return str(filepath)
            
        except Exception as e:
            print(f"Error downloading image {img_url}: {e}")
            return None
    
    def extract_project_info(self, project_element):
        """Extract project information from a portfolio item element"""
        project_data = {
            'name': '',
            'location': '',
            'market': '',
            'jurisdiction': '',
            'size': '',
            'image_url': '',
            'image_path': '',
            'project_url': ''
        }
        
        try:
            # Extract project name
            title_elem = project_element.find(['h3', 'h2', 'h4'], class_=re.compile(r'title|name|project'))
            if not title_elem:
                title_elem = project_element.find(['h3', 'h2', 'h4'])
            if title_elem:
                project_data['name'] = title_elem.get_text(strip=True)
            
            # Extract location/jurisdiction (often in subtitle or description)
            location_elem = project_element.find(class_=re.compile(r'location|subtitle|client|district'))
            if location_elem:
                location_text = location_elem.get_text(strip=True)
                project_data['location'] = location_text
                project_data['jurisdiction'] = location_text
            
            # Try to find image
            img_elem = project_element.find('img')
            if img_elem:
                img_src = img_elem.get('src') or img_elem.get('data-src') or img_elem.get('data-lazy-src')
                if img_src:
                    project_data['image_url'] = img_src
            
            # Try to find project link
            link_elem = project_element.find('a')
            if link_elem and link_elem.get('href'):
                project_data['project_url'] = urljoin(self.base_url, link_elem.get('href'))
            
            # Look for additional metadata in text content
            text_content = project_element.get_text()
            
            # Try to extract market info (common terms)
            market_keywords = ['Elementary', 'High School', 'Middle School', 'University', 'College', 'ISD', 'CISD']
            for keyword in market_keywords:
                if keyword in text_content:
                    if not project_data['market']:
                        project_data['market'] = 'Education'
                    break
            
            if 'Stadium' in text_content or 'Sports' in text_content or 'Athletic' in text_content:
                project_data['market'] = 'Athletics'
            elif 'Performing Arts' in text_content or 'Theater' in text_content:
                project_data['market'] = 'Fine Arts'
            
        except Exception as e:
            print(f"Error extracting project info: {e}")
        
        return project_data
    
    def scrape_portfolio(self):
        """Main scraping function"""
        print("Starting portfolio scrape...")
        
        # Get page content
        html_content = self.get_page_content()
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find portfolio items - try multiple selectors
        portfolio_items = []
        
        # Common selectors for portfolio items
        selectors = [
            '.portfolio-item',
            '.project-item',
            '.work-item',
            '[class*="portfolio"]',
            '[class*="project"]',
            '.grid-item',
            'article'
        ]
        
        for selector in selectors:
            items = soup.select(selector)
            if items:
                portfolio_items = items
                print(f"Found {len(items)} portfolio items using selector: {selector}")
                break
        
        if not portfolio_items:
            # Fallback: look for any elements with images and text
            print("No portfolio items found with standard selectors, trying fallback...")
            portfolio_items = soup.find_all(['div', 'article', 'section'], 
                                          string=re.compile(r'(Elementary|High School|University|College|Center)', re.I))
        
        print(f"Processing {len(portfolio_items)} portfolio items...")
        
        for i, item in enumerate(portfolio_items):
            print(f"\nProcessing item {i+1}/{len(portfolio_items)}")
            
            project_data = self.extract_project_info(item)
            
            if project_data['name']:
                print(f"Found project: {project_data['name']}")
                
                # Download image if available
                if project_data['image_url']:
                    image_path = self.download_image(
                        project_data['image_url'], 
                        project_data['name']
                    )
                    project_data['image_path'] = image_path
                
                self.projects.append(project_data)
            else:
                print("Skipping item - no project name found")
        
        print(f"\nScraping complete! Found {len(self.projects)} projects.")
    
    def save_data(self):
        """Save scraped data to files"""
        if not self.projects:
            print("No project data to save!")
            return
        
        # Save as JSON
        json_file = "pfluger_projects.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.projects, f, indent=2, ensure_ascii=False)
        print(f"Saved project data to {json_file}")
        
        # Save as CSV
        csv_file = "pfluger_projects.csv"
        df = pd.DataFrame(self.projects)
        df.to_csv(csv_file, index=False, encoding='utf-8')
        print(f"Saved project data to {csv_file}")
        
        # Print summary
        print(f"\nSummary:")
        print(f"- Total projects: {len(self.projects)}")
        print(f"- Projects with images: {len([p for p in self.projects if p['image_path']])}")
        print(f"- Markets found: {set(p['market'] for p in self.projects if p['market'])}")
    
    def close(self):
        """Clean up resources"""
        if hasattr(self, 'driver'):
            self.driver.quit()

def main():
    scraper = PflugerScraper()
    
    try:
        scraper.scrape_portfolio()
        scraper.save_data()
    except Exception as e:
        print(f"Error during scraping: {e}")
    finally:
        scraper.close()

if __name__ == "__main__":
    main() 