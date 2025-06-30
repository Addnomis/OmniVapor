#!/usr/bin/env python3
"""
Improved Pfluger Architects Portfolio Scraper

Based on analysis of the actual HTML structure.
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
import time

class ImprovedPflugerScraper:
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
    
    def download_image(self, img_url, project_name, market="Other"):
        """Download and save project image in market-specific subdirectory"""
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
            
            # Create market-specific subdirectory path
            market_dir = market.replace(' ', '_').replace('&', '')
            market_path = self.images_dir / market_dir
            market_path.mkdir(exist_ok=True)
            
            clean_name = self.clean_filename(project_name)
            filename = f"{clean_name}{ext}"
            filepath = market_path / filename
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"Saved: {filepath}")
            return str(filepath)
            
        except Exception as e:
            print(f"Error downloading {img_url}: {e}")
            return None
    
    def determine_market(self, project_name, jurisdiction):
        """Determine market based on project name and jurisdiction"""
        text = f"{project_name} {jurisdiction}".lower()
        
        if any(word in text for word in ['elementary', 'middle school', 'high school', 'isd', 'cisd', 'ninth grade']):
            return 'PreK-12'
        elif any(word in text for word in ['university', 'college']):
            return 'Higher Education'
        elif any(word in text for word in ['stadium', 'sports', 'athletic', 'complex']):
            return 'Athletics'
        elif any(word in text for word in ['performing arts', 'theater', 'concert']):
            return 'Fine Arts'
        elif any(word in text for word in ['cte', 'stem', 'tech', 'development']):
            return 'CTE & STEM'
        else:
            return 'Other'
    
    def extract_project_info(self, portfolio_item):
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
            # Extract project URL
            link = portfolio_item.find('a')
            if link and link.get('href'):
                project_data['project_url'] = urljoin(self.base_url, link.get('href'))
            
            # Extract project name from title
            title_elem = portfolio_item.find('h3', class_='title')
            if title_elem:
                project_data['name'] = title_elem.get_text(strip=True)
            
            # Extract jurisdiction from designation
            designation_elem = portfolio_item.find('h4', class_='designation')
            if designation_elem:
                jurisdiction_text = designation_elem.get_text(strip=True)
                project_data['jurisdiction'] = jurisdiction_text
                project_data['location'] = jurisdiction_text
            
            # Extract image URL (prioritize data-src for lazy loading)
            img_elem = portfolio_item.find('img')
            if img_elem:
                img_src = (img_elem.get('data-src') or 
                          img_elem.get('data-lazy-src') or 
                          img_elem.get('src'))
                if img_src and not img_src.startswith('data:'):
                    project_data['image_url'] = img_src
            
            # Determine market
            project_data['market'] = self.determine_market(
                project_data['name'], 
                project_data['jurisdiction']
            )
            
        except Exception as e:
            print(f"Error extracting project info: {e}")
        
        return project_data
    
    def scrape_portfolio(self):
        """Main scraping function"""
        print("Starting portfolio scrape...")
        
        html_content = self.get_page_content()
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find portfolio items using the class we discovered
        portfolio_items = soup.find_all('div', class_='portfolio-item')
        
        print(f"Found {len(portfolio_items)} portfolio items")
        
        for i, item in enumerate(portfolio_items):
            print(f"\nProcessing item {i+1}/{len(portfolio_items)}")
            
            project_data = self.extract_project_info(item)
            
            if project_data['name']:
                print(f"Found project: {project_data['name']} - {project_data['jurisdiction']}")
                
                # Download image if available
                if project_data['image_url']:
                    image_path = self.download_image(
                        project_data['image_url'], 
                        project_data['name'],
                        project_data['market']
                    )
                    if image_path:
                        project_data['image_path'] = image_path
                    
                    # Add small delay between downloads
                    time.sleep(0.5)
                
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
        json_file = "data/pfluger_projects.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.projects, f, indent=2, ensure_ascii=False)
        print(f"Saved project data to {json_file}")
        
        # Save as CSV
        csv_file = "data/pfluger_projects.csv"
        df = pd.DataFrame(self.projects)
        df.to_csv(csv_file, index=False, encoding='utf-8')
        print(f"Saved project data to {csv_file}")
        
        # Print summary
        print(f"\nSummary:")
        print(f"- Total projects: {len(self.projects)}")
        print(f"- Projects with images: {len([p for p in self.projects if p['image_path']])}")
        
        # Market breakdown
        markets = {}
        for project in self.projects:
            market = project['market']
            markets[market] = markets.get(market, 0) + 1
        
        print(f"- Market breakdown:")
        for market, count in sorted(markets.items()):
            print(f"  {market}: {count} projects")
        
        # Show first few projects
        print(f"\nSample projects:")
        for i, project in enumerate(self.projects[:5]):
            print(f"{i+1}. {project['name']}")
            print(f"   Jurisdiction: {project['jurisdiction']}")
            print(f"   Market: {project['market']}")
            if project['image_path']:
                print(f"   Image: {project['image_path']}")
            print()

def main():
    scraper = ImprovedPflugerScraper()
    scraper.scrape_portfolio()
    scraper.save_data()

if __name__ == "__main__":
    main() 