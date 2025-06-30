#!/usr/bin/env python3
"""
Generate Sample Data for Map Visualization

This script adds realistic sample data to our existing projects:
- Random year built (2010-2025)
- Random size (50,000 - 500,000 SF)
- Sample costs based on size and market
- Basic descriptions based on project type
"""

import json
import random
import pandas as pd
from pathlib import Path

class SampleDataGenerator:
    def __init__(self):
        self.market_cost_multipliers = {
            'PreK-12': 250,  # $250 per SF typical for schools
            'Higher Education': 300,  # $300 per SF for universities
            'CTE & STEM': 350,  # $350 per SF for specialized facilities
            'Athletics': 400,  # $400 per SF for sports facilities
            'Fine Arts': 450,  # $450 per SF for performance spaces
            'Other': 200  # $200 per SF for general construction
        }
        
        self.project_descriptions = {
            'PreK-12': [
                "A modern educational facility designed to inspire learning and creativity.",
                "State-of-the-art school building featuring flexible learning spaces and advanced technology.",
                "Contemporary campus design promoting collaboration and student engagement.",
                "Innovative educational environment with sustainable design features.",
                "Modern learning facility with emphasis on STEM education and community integration."
            ],
            'Higher Education': [
                "Advanced academic facility supporting research and higher learning initiatives.",
                "Modern university building designed for collaborative learning and innovation.",
                "Contemporary campus facility featuring cutting-edge technology and flexible spaces.",
                "State-of-the-art higher education building promoting academic excellence.",
                "Innovative university facility designed to support diverse academic programs."
            ],
            'CTE & STEM': [
                "Specialized facility designed for hands-on technical education and training.",
                "Modern STEM center featuring advanced laboratories and workshop spaces.",
                "Innovation hub supporting career and technical education programs.",
                "State-of-the-art facility for science, technology, engineering, and mathematics education.",
                "Contemporary training center with industry-standard equipment and technology."
            ],
            'Athletics': [
                "Modern athletic facility designed for performance and spectator experience.",
                "State-of-the-art sports complex featuring advanced training and competition spaces.",
                "Contemporary stadium design emphasizing fan engagement and athlete performance.",
                "Innovative sports facility with sustainable design and modern amenities.",
                "Advanced athletic complex supporting diverse sports and recreation programs."
            ],
            'Fine Arts': [
                "Acoustically optimized performance venue designed for artistic excellence.",
                "Modern arts facility featuring flexible performance and rehearsal spaces.",
                "Contemporary cultural center promoting artistic education and community engagement.",
                "State-of-the-art performing arts facility with advanced technical systems.",
                "Innovative arts complex designed to inspire creativity and artistic expression."
            ],
            'Other': [
                "Modern facility designed to meet specific organizational and community needs.",
                "Contemporary building featuring efficient design and sustainable practices.",
                "Innovative facility supporting diverse programs and community services.",
                "State-of-the-art building designed for functionality and user experience.",
                "Modern complex featuring flexible spaces and advanced building systems."
            ]
        }
    
    def generate_year_built(self):
        """Generate random year between 2010-2025"""
        return random.randint(2010, 2025)
    
    def generate_size(self):
        """Generate random size between 50,000-500,000 SF"""
        return random.randint(50000, 500000)
    
    def generate_cost(self, size_sf, market):
        """Generate realistic cost based on size and market type"""
        cost_per_sf = self.market_cost_multipliers.get(market, 250)
        # Add some variation (+/- 20%)
        variation = random.uniform(0.8, 1.2)
        total_cost = size_sf * cost_per_sf * variation
        
        # Format as millions
        cost_millions = total_cost / 1_000_000
        return f"${cost_millions:.1f}M"
    
    def generate_description(self, market, project_name):
        """Generate sample description based on market type"""
        descriptions = self.project_descriptions.get(market, self.project_descriptions['Other'])
        return random.choice(descriptions)
    
    def enhance_projects_with_sample_data(self):
        """Add sample data to existing projects"""
        # Load existing data
        with open('data/pfluger_projects.json', 'r') as f:
            projects = json.load(f)
        
        enhanced_projects = []
        
        for project in projects:
            # Generate sample data
            year_built = self.generate_year_built()
            size_sf = self.generate_size()
            cost = self.generate_cost(size_sf, project['market'])
            description = self.generate_description(project['market'], project['name'])
            
            # Create enhanced project
            enhanced_project = {
                **project,
                'year_built': year_built,
                'size_sf': size_sf,
                'size': f"{size_sf:,} SF",
                'cost': cost,
                'description': description,
                'state': 'Texas'  # Default to Texas for most projects
            }
            
            # Handle Louisiana projects
            if 'Lafayette' in project.get('jurisdiction', ''):
                enhanced_project['state'] = 'Louisiana'
            
            enhanced_projects.append(enhanced_project)
        
        return enhanced_projects
    
    def save_enhanced_data(self, projects):
        """Save enhanced project data"""
        # Save as JSON
        json_file = "data/enhanced_pfluger_projects.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(projects, f, indent=2, ensure_ascii=False)
        print(f"Saved enhanced data to {json_file}")
        
        # Save as CSV
        csv_file = "data/enhanced_pfluger_projects.csv"
        df = pd.DataFrame(projects)
        df.to_csv(csv_file, index=False, encoding='utf-8')
        print(f"Saved enhanced data to {csv_file}")
        
        # Print summary statistics
        print(f"\n=== Data Summary ===")
        print(f"Total projects: {len(projects)}")
        print(f"Year range: {min(p['year_built'] for p in projects)} - {max(p['year_built'] for p in projects)}")
        print(f"Size range: {min(p['size_sf'] for p in projects):,} - {max(p['size_sf'] for p in projects):,} SF")
        
        # Market breakdown
        markets = {}
        for project in projects:
            market = project['market']
            markets[market] = markets.get(market, 0) + 1
        
        print(f"\nMarket breakdown:")
        for market, count in sorted(markets.items()):
            print(f"  {market}: {count} projects")

def main():
    generator = SampleDataGenerator()
    enhanced_projects = generator.enhance_projects_with_sample_data()
    generator.save_enhanced_data(enhanced_projects)
    print(f"\nSuccessfully enhanced {len(enhanced_projects)} projects with sample data!")

if __name__ == "__main__":
    main() 