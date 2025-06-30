#!/usr/bin/env python3
"""
Test Enhanced Scraper on a few projects
"""

import json
from enhanced_scraper import EnhancedPflugerScraper

def test_enhanced_scraper():
    """Test the enhanced scraper on first 3 projects"""
    # Load existing data
    with open('data/pfluger_projects.json', 'r') as f:
        projects = json.load(f)
    
    scraper = EnhancedPflugerScraper()
    
    # Test on first 3 projects
    test_projects = projects[:3]
    enhanced_projects = []
    
    for i, project in enumerate(test_projects):
        print(f"\n=== Testing {i+1}/3: {project['name']} ===")
        
        # Get additional details from project page
        details = scraper.extract_project_details(project['project_url'])
        
        # Merge with existing data
        enhanced_project = {**project, **details}
        enhanced_projects.append(enhanced_project)
        
        # Print what we found
        print(f"Year Built: {details['year_built']}")
        print(f"Cost: {details['cost']}")
        print(f"Size: {details['size']}")
        print(f"State: {details['state']}")
        print(f"Description: {details['description'][:100] if details['description'] else 'None'}...")
    
    # Save test results
    with open('data/test_enhanced_projects.json', 'w', encoding='utf-8') as f:
        json.dump(enhanced_projects, f, indent=2, ensure_ascii=False)
    
    print(f"\nTest completed! Enhanced {len(enhanced_projects)} projects.")
    print("Saved test results to data/test_enhanced_projects.json")

if __name__ == "__main__":
    test_enhanced_scraper() 