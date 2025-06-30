#!/usr/bin/env python3
"""
Enhanced Pfluger Architects Scraper

This script enhances our existing data by visiting individual project pages
to extract additional details like year built, cost, size, and descriptions.
"""

import json
import re
import requests
from bs4 import BeautifulSoup
import time
from pathlib import Path
import pandas as pd
from typing import Dict, Any, Optional

class EnhancedPflugerScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
    def extract_project_details(self, project_url):
        """Extract additional details from individual project pages"""
        try:
            print(f"Fetching details from: {project_url}")
            response = self.session.get(project_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            details: Dict[str, Any] = {
                'year_built': None,
                'cost': None,
                'size': None,
                'description': None,
                'city': None,
                'state': None
            }
            
            # Look for project details in various formats
            # Common patterns: "Completed: 2023", "Year: 2022", "Cost: $5M", "Size: 50,000 SF"
            
            # Search in text content
            text_content = soup.get_text()
            
            # Extract year
            year_patterns = [
                r'(?:completed|built|opened|finished):\s*(\d{4})',
                r'year:\s*(\d{4})',
                r'(\d{4})\s*completion',
                r'completed\s+in\s+(\d{4})',
                r'opened\s+in\s+(\d{4})'
            ]
            
            for pattern in year_patterns:
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    details['year_built'] = int(match.group(1))
                    break
            
            # Extract cost
            cost_patterns = [
                r'cost:\s*\$?([\d,]+(?:\.\d+)?)\s*(?:million|m|k)?',
                r'\$?([\d,]+(?:\.\d+)?)\s*(?:million|m)\s*(?:project|cost|budget)',
                r'budget:\s*\$?([\d,]+(?:\.\d+)?)\s*(?:million|m|k)?'
            ]
            
            for pattern in cost_patterns:
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    details['cost'] = match.group(0)
                    break
            
            # Extract size/square footage
            size_patterns = [
                r'([\d,]+)\s*(?:square\s*feet|sq\.?\s*ft\.?|sf)',
                r'size:\s*([\d,]+)\s*(?:square\s*feet|sq\.?\s*ft\.?|sf)',
                r'([\d,]+)\s*sf\b'
            ]
            
            for pattern in size_patterns:
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    details['size'] = match.group(0)
                    break
            
            # Extract description - look for project description or summary
            desc_selectors = [
                '.project-description',
                '.entry-content p',
                '.content p',
                'p'
            ]
            
            for selector in desc_selectors:
                desc_elements = soup.select(selector)
                if desc_elements:
                    # Get first substantial paragraph
                    for elem in desc_elements:
                        text = elem.get_text().strip()
                        if len(text) > 50 and not text.startswith('Contact'):
                            details['description'] = text[:300] + ('...' if len(text) > 300 else '')
                            break
                    if details['description']:
                        break
            
            # Look for location details in structured data or specific elements
            location_elements = soup.find_all(text=re.compile(r'Texas|TX|Louisiana|LA', re.IGNORECASE))
            for elem in location_elements:
                if 'Texas' in elem or 'TX' in elem:
                    details['state'] = 'Texas'
                elif 'Louisiana' in elem or 'LA' in elem:
                    details['state'] = 'Louisiana'
                break
            
            return details
            
        except Exception as e:
            print(f"Error extracting details from {project_url}: {e}")
            return {
                'year_built': None,
                'cost': None,
                'size': None,
                'description': None,
                'city': None,
                'state': None
            }
    
    def enhance_existing_data(self):
        """Enhance our existing project data with additional details"""
        # Load existing data
        with open('data/pfluger_projects.json', 'r') as f:
            projects = json.load(f)
        
        enhanced_projects = []
        
        for i, project in enumerate(projects):
            print(f"\nProcessing {i+1}/{len(projects)}: {project['name']}")
            
            # Get additional details from project page
            details = self.extract_project_details(project['project_url'])
            
            # Merge with existing data
            enhanced_project = {**project, **details}
            enhanced_projects.append(enhanced_project)
            
            # Add delay to be respectful to the server
            time.sleep(1)
            
            # Save progress every 10 projects
            if (i + 1) % 10 == 0:
                self.save_enhanced_data(enhanced_projects, f"enhanced_projects_backup_{i+1}.json")
        
        # Save final enhanced data
        self.save_enhanced_data(enhanced_projects)
        return enhanced_projects
    
    def save_enhanced_data(self, projects, filename="enhanced_pfluger_projects.json"):
        """Save enhanced project data"""
        # Save as JSON
        json_file = f"data/{filename}"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(projects, f, indent=2, ensure_ascii=False)
        print(f"Saved enhanced data to {json_file}")
        
        # Save as CSV
        if filename.endswith('.json'):
            csv_file = f"data/{filename.replace('.json', '.csv')}"
            df = pd.DataFrame(projects)
            df.to_csv(csv_file, index=False, encoding='utf-8')
            print(f"Saved enhanced data to {csv_file}")

def main():
    scraper = EnhancedPflugerScraper()
    enhanced_projects = scraper.enhance_existing_data()
    print(f"\nEnhanced {len(enhanced_projects)} projects with additional details!")

if __name__ == "__main__":
    main() 