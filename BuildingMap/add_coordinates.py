#!/usr/bin/env python3
"""
Add Geographic Coordinates to Projects

This script adds approximate latitude/longitude coordinates to projects
based on their jurisdiction/location information.
"""

import json
import pandas as pd

class CoordinateMapper:
    def __init__(self):
        # Approximate coordinates for Texas cities and regions
        # These are rough estimates for visualization purposes
        self.texas_coordinates = {
            # Major Cities
            'Austin': [30.2672, -97.7431],
            'Houston': [29.7604, -95.3698],
            'Dallas': [32.7767, -96.7970],
            'San Antonio': [29.4241, -98.4936],
            'Fort Worth': [32.7555, -97.3308],
            
            # School Districts and Areas (approximate)
            'Lamar CISD': [29.5844, -95.9039],  # Richmond area
            'Midland ISD': [32.0174, -102.0779],  # Midland
            'Del Valle ISD': [30.1833, -97.6803],  # Southeast Austin
            'Austin Community College': [30.2672, -97.7431],  # Austin
            'Burleson ISD': [32.5421, -97.3208],  # Burleson
            'Austin ISD': [30.2672, -97.7431],  # Austin
            'Hutto ISD': [30.5427, -97.5461],  # Hutto
            'Texas State University': [29.8883, -97.9384],  # San Marcos
            'Comal ISD': [29.7030, -98.1245],  # New Braunfels area
            'Goose Creek CISD': [29.7355, -95.0560],  # Baytown area
            'Concordia University': [30.3072, -97.7278],  # Austin
            'Alamo Colleges': [29.4241, -98.4936],  # San Antonio
            'Denton ISD': [33.2148, -97.1331],  # Denton
            'Southwest ISD': [29.3013, -98.7264],  # Southwest San Antonio
            'Universal Technical Institute': [30.2672, -97.7431],  # Austin area
            'Pflugerville ISD': [30.4427, -97.6200],  # Pflugerville
            'Cornerstone Christian Schools': [29.4241, -98.4936],  # San Antonio area
            'Dallas ISD': [32.7767, -96.7970],  # Dallas
            'Texas City ISD': [29.3838, -94.9027],  # Texas City
            'Tarleton State University': [32.2207, -98.2020],  # Stephenville
            'Pre-K 4 SA': [29.4241, -98.4936],  # San Antonio
            'Westwood ISD': [31.2638, -97.4811],  # Palestine area
            'Texas Lutheran University': [29.7030, -98.1245],  # Seguin
            'Liberty Hill ISD': [30.6638, -97.9225],  # Liberty Hill
            'Humble ISD': [29.9988, -95.2621],  # Humble
            'Boerne ISD': [29.7946, -98.7320],  # Boerne
            'North East ISD': [29.5449, -98.3439],  # Northeast San Antonio
            'Alamo Colleges District': [29.4241, -98.4936],  # San Antonio
            'Cotulla ISD': [28.4361, -99.2353],  # Cotulla
            'The University of Texas at Austin': [30.2849, -97.7341],  # UT Austin
            'Spring Branch ISD': [29.7833, -95.5555],  # Spring Branch
            'Spring ISD': [30.0799, -95.4171],  # Spring
            'Round Rock ISD': [30.5083, -97.6789],  # Round Rock
            'United ISD': [27.5306, -99.4803],  # Laredo
            'City of San Antonio': [29.4241, -98.4936],  # San Antonio
            'Galena Park ISD': [29.7355, -95.0560],  # Galena Park
            'Leander ISD': [30.5788, -97.8536],  # Leander
            'West Texas A&M University': [35.1983, -101.8313],  # Canyon
            
            # Other Texas locations
            'Dallas, TX': [32.7767, -96.7970],
        }
        
        # Louisiana coordinates
        self.louisiana_coordinates = {
            'Lafayette Parish School System': [30.2241, -92.0198],  # Lafayette, LA
        }
    
    def get_coordinates(self, jurisdiction, location, state):
        """Get coordinates based on jurisdiction and location"""
        
        # Try exact jurisdiction match first
        if state == 'Texas' and jurisdiction in self.texas_coordinates:
            return self.texas_coordinates[jurisdiction]
        elif state == 'Louisiana' and jurisdiction in self.louisiana_coordinates:
            return self.louisiana_coordinates[jurisdiction]
        
        # Try location match
        if state == 'Texas' and location in self.texas_coordinates:
            return self.texas_coordinates[location]
        elif state == 'Louisiana' and location in self.louisiana_coordinates:
            return self.louisiana_coordinates[location]
        
        # Try partial matches for Texas
        if state == 'Texas':
            for key, coords in self.texas_coordinates.items():
                if key.lower() in jurisdiction.lower() or key.lower() in location.lower():
                    return coords
        
        # Default coordinates (center of Texas or Louisiana)
        if state == 'Louisiana':
            return [30.9843, -91.9623]  # Center of Louisiana
        else:
            return [31.9686, -99.9018]  # Center of Texas
    
    def add_coordinates_to_projects(self):
        """Add coordinates to all projects"""
        # Load enhanced data
        with open('data/enhanced_pfluger_projects.json', 'r') as f:
            projects = json.load(f)
        
        enhanced_projects = []
        
        for project in projects:
            # Get coordinates
            coords = self.get_coordinates(
                project['jurisdiction'], 
                project['location'], 
                project['state']
            )
            
            # Add coordinates to project
            enhanced_project = {
                **project,
                'latitude': coords[0],
                'longitude': coords[1]
            }
            
            enhanced_projects.append(enhanced_project)
            
            print(f"Added coordinates for {project['name']}: {coords}")
        
        return enhanced_projects
    
    def save_final_data(self, projects):
        """Save final project data with coordinates"""
        # Save as JSON
        json_file = "data/final_pfluger_projects.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(projects, f, indent=2, ensure_ascii=False)
        print(f"\nSaved final data to {json_file}")
        
        # Save as CSV
        csv_file = "data/final_pfluger_projects.csv"
        df = pd.DataFrame(projects)
        df.to_csv(csv_file, index=False, encoding='utf-8')
        print(f"Saved final data to {csv_file}")
        
        # Print coordinate summary
        print(f"\n=== Coordinate Summary ===")
        print(f"Total projects: {len(projects)}")
        
        texas_projects = [p for p in projects if p['state'] == 'Texas']
        louisiana_projects = [p for p in projects if p['state'] == 'Louisiana']
        
        print(f"Texas projects: {len(texas_projects)}")
        print(f"Louisiana projects: {len(louisiana_projects)}")
        
        if texas_projects:
            lat_range = [min(p['latitude'] for p in texas_projects), max(p['latitude'] for p in texas_projects)]
            lng_range = [min(p['longitude'] for p in texas_projects), max(p['longitude'] for p in texas_projects)]
            print(f"Texas coordinate range: Lat {lat_range[0]:.2f} to {lat_range[1]:.2f}, Lng {lng_range[0]:.2f} to {lng_range[1]:.2f}")

def main():
    mapper = CoordinateMapper()
    projects_with_coords = mapper.add_coordinates_to_projects()
    mapper.save_final_data(projects_with_coords)
    print(f"\nSuccessfully added coordinates to {len(projects_with_coords)} projects!")

if __name__ == "__main__":
    main() 