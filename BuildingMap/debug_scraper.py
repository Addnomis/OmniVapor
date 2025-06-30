#!/usr/bin/env python3
"""
Debug scraper to analyze the Pfluger website structure
"""

import requests
from bs4 import BeautifulSoup
import re

def debug_website():
    url = "https://pflugerarchitects.com/portfolio/"
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    
    print(f"Fetching: {url}")
    response = session.get(url, timeout=30)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Save raw HTML for inspection
    with open('debug_page.html', 'w', encoding='utf-8') as f:
        f.write(response.text)
    print("Saved raw HTML to debug_page.html")
    
    # Look for common portfolio/project containers
    print("\n=== ANALYZING PAGE STRUCTURE ===")
    
    # Check for various container types
    containers = [
        ('div with portfolio in class', soup.find_all('div', class_=re.compile(r'portfolio', re.I))),
        ('div with project in class', soup.find_all('div', class_=re.compile(r'project', re.I))),
        ('div with grid in class', soup.find_all('div', class_=re.compile(r'grid', re.I))),
        ('article elements', soup.find_all('article')),
        ('section elements', soup.find_all('section')),
        ('divs containing img tags', soup.find_all('div'))
    ]
    
    for name, elements in containers:
        print(f"\n{name}: {len(elements)} found")
        if elements:
            for i, elem in enumerate(elements[:3]):  # Show first 3
                print(f"  {i+1}. Classes: {elem.get('class', [])}")
                text = elem.get_text(strip=True)[:100]
                print(f"     Text: {text}...")
    
    # Look for all images
    images = soup.find_all('img')
    print(f"\n=== IMAGES FOUND: {len(images)} ===")
    for i, img in enumerate(images[:10]):  # Show first 10
        src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
        alt = img.get('alt', '')
        print(f"{i+1}. {src} (alt: {alt})")
    
    # Look for text that contains project names
    print(f"\n=== TEXT ANALYSIS ===")
    text_content = soup.get_text()
    lines = text_content.split('\n')
    
    # Filter for lines that look like project names
    project_keywords = ['School', 'Elementary', 'High School', 'Middle School', 
                       'University', 'College', 'Center', 'Stadium', 'Complex', 'Hall']
    
    potential_projects = []
    for line in lines:
        line = line.strip()
        if (len(line) > 10 and len(line) < 100 and
            any(keyword in line for keyword in project_keywords) and
            not line.startswith('Select') and
            not line.startswith('Clear') and
            not line.startswith('©') and
            'javascript' not in line.lower()):
            potential_projects.append(line)
    
    print(f"Found {len(potential_projects)} potential project lines:")
    for i, project in enumerate(potential_projects[:20]):  # Show first 20
        print(f"{i+1}. {project}")
    
    # Look for specific selectors
    print(f"\n=== SPECIFIC SELECTORS ===")
    specific_selectors = [
        'a[href*="portfolio"]',
        '.portfolio-item',
        '.project-item',
        '.work-item',
        '[data-project]',
        '.grid-item'
    ]
    
    for selector in specific_selectors:
        elements = soup.select(selector)
        print(f"{selector}: {len(elements)} elements")
        if elements:
            for elem in elements[:3]:
                text = elem.get_text(strip=True)[:50]
                print(f"  - {text}...")

if __name__ == "__main__":
    debug_website() 