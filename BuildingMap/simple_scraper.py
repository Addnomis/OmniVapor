#!/usr/bin/env python3
"""
Simple Pfluger Architects Portfolio Scraper

A lightweight version using only requests and BeautifulSoup.
"""

import os
import re
import json
import csv
import requests
from urllib.parse import urljoin, urlparse
from pathlib import Path
import pandas as pd
from bs4 import BeautifulSoup

class SimplePflugerScraper:
    def __init__(self, base_url="https://pflugerarchitects.com/portfolio/"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.projects = []
        self.images_dir = Path("images")
        self.images_dir.mkdir(exist_ok=True)
    
    def get_page_content(self):
        """Load the portfolio page content"""
        print(f"Loading portfolio page: {self.base_url}")
        
        response = self.session.get(self.base_url, timeout=30)
        response.raise_for_status()
        return response.text
    
    def clean_filename(self, filename):
        """Clean filename for safe file system storage"""
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        filename = re.sub(r'\s+', '_', filename)
        filename = filename.strip('._')
        return filename[:100]
    
    def download_image(self, img_url, project_name):
        """Download and save project image"""
        try:
            if not img_url.startswith('http'):
                img_url = urljoin(self.base_url, img_url)
            
            print(f"Downloading: {img_url}")
            
            response = self.session.get(img_url, timeout=30)
            response.raise_for_status()
            
            # Determine file extension
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
                    ext = '.jpg'
            
            clean_name = self.clean_filename(project_name)
            filename = f"{clean_name}{ext}"
            filepath = self.images_dir / filename
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"Saved: {filepath}")
            return str(filepath)
            
        except Exception as e:
            print(f"Error downloading {img_url}: {e}")
            return None
    
    def extract_project_from_text(self, text_line):
        """Extract project info from a text line like 'Haygood Elementary School Lamar CISD'"""
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
        
        # Clean the text
        text_line = text_line.strip()
        
        # Split by common patterns
        parts = text_line.split()
        
        # Look for ISD, CISD, University, College, etc. (jurisdiction indicators)
        jurisdiction_keywords = ['ISD', 'CISD', 'University', 'College', 'District', 'System']
        jurisdiction_parts = []
        project_parts = []
        
        for part in parts:
            if any(keyword in part for keyword in jurisdiction_keywords):
                jurisdiction_parts.append(part)
            else:
                project_parts.append(part)
        
        # If we found jurisdiction keywords, everything before them is likely the project name
        if jurisdiction_parts:
            # Find the position of the first jurisdiction keyword
            for i, part in enumerate(parts):
                if any(keyword in part for keyword in jurisdiction_keywords):
                    project_parts = parts[:i]
                    jurisdiction_parts = parts[i:]
                    break
        
        project_data['name'] = ' '.join(project_parts)
        project_data['jurisdiction'] = ' '.join(jurisdiction_parts)
        project_data['location'] = ' '.join(jurisdiction_parts)
        
        # Determine market based on keywords
        text_lower = text_line.lower()
        if any(word in text_lower for word in ['elementary', 'middle', 'high school', 'isd', 'cisd']):
            project_data['market'] = 'PreK-12'
        elif any(word in text_lower for word in ['university', 'college']):
            project_data['market'] = 'Higher Education'
        elif any(word in text_lower for word in ['stadium', 'sports', 'athletic']):
            project_data['market'] = 'Athletics'
        elif any(word in text_lower for word in ['performing arts', 'theater', 'concert']):
            project_data['market'] = 'Fine Arts'
        else:
            project_data['market'] = 'Other'
        
        return project_data
    
    def scrape_portfolio(self):
        """Main scraping function"""
        print("Starting portfolio scrape...")
        
        html_content = self.get_page_content()
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Based on the website content provided, look for project text patterns
        # The projects seem to be listed as text lines
        
        # First, try to find structured portfolio items
        portfolio_items = soup.find_all(['div', 'article', 'section'], 
                                       class_=re.compile(r'portfolio|project|work', re.I))
        
        if not portfolio_items:
            # Look for the main content area
            main_content = soup.find('main') or soup.find('div', class_='content') or soup.body
            
            if main_content:
                # Extract all text and look for project patterns
                text_content = main_content.get_text()
                lines = text_content.split('\n')
                
                # Filter for lines that look like project names
                project_lines = []
                for line in lines:
                    line = line.strip()
                    # Look for lines with school/building names
                    if (len(line) > 10 and 
                        any(keyword in line for keyword in ['School', 'Elementary', 'High School', 'Middle School', 
                                                          'University', 'College', 'Center', 'Stadium', 'Complex', 'Hall']) and
                        not line.startswith('Select') and
                        not line.startswith('Clear')):
                        project_lines.append(line)
                
                print(f"Found {len(project_lines)} potential project lines")
                
                for line in project_lines:
                    project_data = self.extract_project_from_text(line)
                    if project_data['name']:
                        self.projects.append(project_data)
                        print(f"Added project: {project_data['name']}")
        
        # Try to find images separately
        images = soup.find_all('img')
        print(f"Found {len(images)} images on the page")
        
        # Match images to projects if possible
        for i, img in enumerate(images):
            img_src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if img_src and i < len(self.projects):
                self.projects[i]['image_url'] = img_src
                
                # Download the image
                image_path = self.download_image(img_src, self.projects[i]['name'])
                if image_path:
                    self.projects[i]['image_path'] = image_path
        
        print(f"\nScraping complete! Found {len(self.projects)} projects.")
    
    def save_data(self):
        """Save scraped data to files"""
        if not self.projects:
            print("No project data to save!")
            return
        
        # Save as JSON
        json_file = "pfluger_projects_simple.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.projects, f, indent=2, ensure_ascii=False)
        print(f"Saved project data to {json_file}")
        
        # Save as CSV
        csv_file = "pfluger_projects_simple.csv"
        df = pd.DataFrame(self.projects)
        df.to_csv(csv_file, index=False, encoding='utf-8')
        print(f"Saved project data to {csv_file}")
        
        # Print summary
        print(f"\nSummary:")
        print(f"- Total projects: {len(self.projects)}")
        print(f"- Projects with images: {len([p for p in self.projects if p['image_path']])}")
        print(f"- Markets found: {set(p['market'] for p in self.projects if p['market'])}")
        
        # Print first few projects as sample
        print(f"\nSample projects:")
        for i, project in enumerate(self.projects[:3]):
            print(f"{i+1}. {project['name']} - {project['jurisdiction']} ({project['market']})")

def main():
    scraper = SimplePflugerScraper()
    scraper.scrape_portfolio()
    scraper.save_data()

if __name__ == "__main__":
    main() 