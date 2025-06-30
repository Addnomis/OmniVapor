#!/usr/bin/env python3
"""
Equirectangular Converter - Convert 2D architectural images to 360° placeholders

This script processes the Pfluger Architects project images and creates
equirectangular (360°) placeholder images suitable for dome projection.
Since we don't have true 360° images, we create immersive placeholders
that work well in dome environments.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EquirectangularConverter:
    """Convert 2D architectural images to 360° equirectangular placeholders"""
    
    def __init__(self, output_width: int = 4096, output_height: int = 2048):
        self.output_width = output_width
        self.output_height = output_height
        self.aspect_ratio = output_width / output_height
        
    def convert_image(self, input_path: str, output_path: str, 
                     conversion_type: str = 'architectural') -> Dict:
        """
        Convert a 2D image to equirectangular format
        
        Args:
            input_path: Path to source image
            output_path: Path for output equirectangular image
            conversion_type: Type of conversion ('architectural', 'landscape', 'interior')
            
        Returns:
            Dictionary with conversion metadata
        """
        try:
            # Load source image
            source_img = Image.open(input_path)
            logger.info(f"Processing {input_path} -> {output_path}")
            
            # Create equirectangular canvas
            equirect_img = Image.new('RGB', (self.output_width, self.output_height), 
                                   (135, 206, 235))  # Sky blue background
            
            if conversion_type == 'architectural':
                result = self._convert_architectural_image(source_img, equirect_img)
            elif conversion_type == 'landscape':
                result = self._convert_landscape_image(source_img, equirect_img)
            elif conversion_type == 'interior':
                result = self._convert_interior_image(source_img, equirect_img)
            else:
                result = self._convert_generic_image(source_img, equirect_img)
            
            # Save the result
            result.save(output_path, 'JPEG', quality=90)
            
            # Generate metadata
            metadata = {
                'source_image': input_path,
                'output_image': output_path,
                'conversion_type': conversion_type,
                'dimensions': {
                    'width': self.output_width,
                    'height': self.output_height
                },
                'source_dimensions': {
                    'width': source_img.width,
                    'height': source_img.height
                },
                'field_of_view': 360,
                'projection': 'equirectangular',
                'optimized_for_dome': True,
                'dome_metadata': {
                    'preferred_view_angle': {
                        'azimuth': 0,
                        'elevation': 0,
                        'distance': 0.8
                    },
                    'interaction_zones': []
                }
            }
            
            logger.info(f"Successfully converted {input_path}")
            return metadata
            
        except Exception as e:
            logger.error(f"Error converting {input_path}: {str(e)}")
            raise
    
    def _convert_architectural_image(self, source: Image.Image, 
                                   canvas: Image.Image) -> Image.Image:
        """Convert architectural building image to equirectangular"""
        # Resize source to fit in center portion of equirectangular image
        # Buildings typically look best when placed in the central horizontal band
        
        # Calculate optimal size for building (occupy central 60% of height)
        target_height = int(canvas.height * 0.6)
        aspect_ratio = source.width / source.height
        target_width = int(target_height * aspect_ratio)
        
        # Ensure width doesn't exceed canvas
        if target_width > canvas.width * 0.8:
            target_width = int(canvas.width * 0.8)
            target_height = int(target_width / aspect_ratio)
        
        # Resize source image
        resized_source = source.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Position building in center
        x_offset = (canvas.width - target_width) // 2
        y_offset = (canvas.height - target_height) // 2
        
        # Add ground plane
        self._add_ground_plane(canvas, y_offset + target_height)
        
        # Paste building onto canvas
        canvas.paste(resized_source, (x_offset, y_offset))
        
        # Add architectural context (repeated building for 360° effect)
        self._add_architectural_context(canvas, resized_source, x_offset, y_offset)
        
        # Add sky gradient
        self._add_sky_gradient(canvas, y_offset)
        
        return canvas
    
    def _convert_landscape_image(self, source: Image.Image, 
                               canvas: Image.Image) -> Image.Image:
        """Convert landscape image to equirectangular"""
        # For landscapes, stretch horizontally and add sky
        
        # Resize to full width, partial height
        target_height = int(canvas.height * 0.7)
        resized_source = source.resize((canvas.width, target_height), Image.Resampling.LANCZOS)
        
        # Position in lower portion
        y_offset = canvas.height - target_height
        canvas.paste(resized_source, (0, y_offset))
        
        # Add sky
        self._add_sky_gradient(canvas, y_offset)
        
        return canvas
    
    def _convert_interior_image(self, source: Image.Image, 
                              canvas: Image.Image) -> Image.Image:
        """Convert interior image to equirectangular"""
        # For interiors, create a room-like environment
        
        # Use source as front wall
        wall_height = int(canvas.height * 0.8)
        wall_width = int(canvas.width * 0.25)  # 90 degrees of 360
        
        front_wall = source.resize((wall_width, wall_height), Image.Resampling.LANCZOS)
        
        # Position front wall
        x_offset = (canvas.width - wall_width) // 2
        y_offset = (canvas.height - wall_height) // 2
        canvas.paste(front_wall, (x_offset, y_offset))
        
        # Create side walls (darker versions)
        side_wall = front_wall.copy()
        enhancer = ImageEnhance.Brightness(side_wall)
        side_wall = enhancer.enhance(0.7)
        
        # Left wall
        canvas.paste(side_wall, (x_offset - wall_width, y_offset))
        # Right wall  
        canvas.paste(side_wall, (x_offset + wall_width, y_offset))
        
        # Add floor and ceiling
        self._add_interior_floor_ceiling(canvas, y_offset, wall_height)
        
        return canvas
    
    def _convert_generic_image(self, source: Image.Image, 
                             canvas: Image.Image) -> Image.Image:
        """Generic conversion for any image type"""
        # Simple center placement with mirrored edges
        
        # Resize to fit in center
        target_height = int(canvas.height * 0.8)
        aspect_ratio = source.width / source.height
        target_width = int(target_height * aspect_ratio)
        
        if target_width > canvas.width * 0.6:
            target_width = int(canvas.width * 0.6)
            target_height = int(target_width / aspect_ratio)
        
        resized_source = source.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Center placement
        x_offset = (canvas.width - target_width) // 2
        y_offset = (canvas.height - target_height) // 2
        canvas.paste(resized_source, (x_offset, y_offset))
        
        # Mirror edges for seamless 360° effect
        self._mirror_edges(canvas, resized_source, x_offset, y_offset)
        
        return canvas
    
    def _add_ground_plane(self, canvas: Image.Image, ground_y: int):
        """Add a ground plane below the building"""
        draw = ImageDraw.Draw(canvas)
        
        # Create gradient ground
        for y in range(ground_y, canvas.height):
            intensity = int(120 - (y - ground_y) * 0.5)
            intensity = max(60, min(120, intensity))
            color = (intensity, intensity + 20, intensity + 10)  # Brownish ground
            draw.line([(0, y), (canvas.width, y)], fill=color)
    
    def _add_sky_gradient(self, canvas: Image.Image, sky_start_y: int):
        """Add sky gradient above the main content"""
        draw = ImageDraw.Draw(canvas)
        
        for y in range(0, sky_start_y):
            # Gradient from light blue to darker blue
            progress = y / sky_start_y
            blue_intensity = int(235 - progress * 100)
            color = (135, 206, blue_intensity)
            draw.line([(0, y), (canvas.width, y)], fill=color)
    
    def _add_architectural_context(self, canvas: Image.Image, building: Image.Image,
                                 center_x: int, center_y: int):
        """Add repeated buildings for architectural context"""
        building_width = building.width
        
        # Create smaller, faded versions for distance
        distant_building = building.resize((building_width // 2, building.height // 2), 
                                         Image.Resampling.LANCZOS)
        
        # Fade distant buildings
        enhancer = ImageEnhance.Brightness(distant_building)
        distant_building = enhancer.enhance(0.6)
        
        # Place distant buildings to left and right
        left_x = center_x - building_width - distant_building.width
        right_x = center_x + building_width
        distant_y = center_y + building.height - distant_building.height
        
        if left_x >= 0:
            canvas.paste(distant_building, (left_x, distant_y))
        if right_x + distant_building.width <= canvas.width:
            canvas.paste(distant_building, (right_x, distant_y))
    
    def _add_interior_floor_ceiling(self, canvas: Image.Image, wall_y: int, wall_height: int):
        """Add floor and ceiling for interior spaces"""
        draw = ImageDraw.Draw(canvas)
        
        # Floor (bottom)
        floor_start = wall_y + wall_height
        for y in range(floor_start, canvas.height):
            intensity = int(100 - (y - floor_start) * 2)
            intensity = max(50, min(100, intensity))
            color = (intensity + 20, intensity + 15, intensity)  # Wooden floor
            draw.line([(0, y), (canvas.width, y)], fill=color)
        
        # Ceiling (top)
        for y in range(0, wall_y):
            intensity = int(200 + (wall_y - y) * 0.5)
            intensity = max(180, min(220, intensity))
            color = (intensity, intensity, intensity)  # White ceiling
            draw.line([(0, y), (canvas.width, y)], fill=color)
    
    def _mirror_edges(self, canvas: Image.Image, source: Image.Image,
                     center_x: int, center_y: int):
        """Mirror source image at edges for seamless 360° effect"""
        # This is a simplified implementation
        # In practice, you'd want more sophisticated edge blending
        pass

def process_pfluger_projects(input_dir: str, output_dir: str, 
                           projects_json: str) -> Dict:
    """
    Process all Pfluger project images and convert to equirectangular format
    
    Args:
        input_dir: Directory containing project images
        output_dir: Directory for equirectangular outputs
        projects_json: Path to projects JSON file
        
    Returns:
        Dictionary with processing results and metadata
    """
    converter = EquirectangularConverter()
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Load project data
    with open(projects_json, 'r') as f:
        projects = json.load(f)
    
    results = {
        'processed_count': 0,
        'failed_count': 0,
        'metadata': [],
        'errors': []
    }
    
    for project in projects:
        try:
            # Determine image path
            image_filename = os.path.basename(project['image_path'])
            input_path = os.path.join(input_dir, project['market'], image_filename)
            
            if not os.path.exists(input_path):
                logger.warning(f"Image not found: {input_path}")
                continue
            
            # Generate output path
            name_safe = project['name'].replace('/', '_').replace(' ', '_')
            output_filename = f"{name_safe}_360.jpg"
            output_path = os.path.join(output_dir, output_filename)
            
            # Determine conversion type based on market
            conversion_type = 'architectural'
            if 'Athletics' in project['market'] or 'Fine Arts' in project['market']:
                conversion_type = 'landscape'
            elif 'interior' in project['description'].lower():
                conversion_type = 'interior'
            
            # Convert image
            metadata = converter.convert_image(input_path, output_path, conversion_type)
            
            # Add project-specific metadata
            metadata['project'] = {
                'name': project['name'],
                'market': project['market'],
                'location': project['location'],
                'coordinates': {
                    'lat': project['latitude'],
                    'lng': project['longitude']
                }
            }
            
            results['metadata'].append(metadata)
            results['processed_count'] += 1
            
        except Exception as e:
            error_msg = f"Failed to process {project['name']}: {str(e)}"
            logger.error(error_msg)
            results['errors'].append(error_msg)
            results['failed_count'] += 1
    
    # Save metadata
    metadata_path = os.path.join(output_dir, 'equirectangular_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Processing complete: {results['processed_count']} successful, "
               f"{results['failed_count']} failed")
    
    return results

def main():
    parser = argparse.ArgumentParser(description='Convert 2D images to equirectangular format')
    parser.add_argument('--input-dir', required=True, 
                       help='Directory containing source images')
    parser.add_argument('--output-dir', required=True,
                       help='Directory for equirectangular outputs')
    parser.add_argument('--projects-json', required=True,
                       help='Path to projects JSON file')
    parser.add_argument('--width', type=int, default=4096,
                       help='Output width (default: 4096)')
    parser.add_argument('--height', type=int, default=2048,
                       help='Output height (default: 2048)')
    
    args = parser.parse_args()
    
    # Validate inputs
    if not os.path.exists(args.input_dir):
        logger.error(f"Input directory not found: {args.input_dir}")
        sys.exit(1)
    
    if not os.path.exists(args.projects_json):
        logger.error(f"Projects JSON not found: {args.projects_json}")
        sys.exit(1)
    
    # Process images
    try:
        results = process_pfluger_projects(args.input_dir, args.output_dir, args.projects_json)
        
        print(f"\n✅ Conversion complete!")
        print(f"📊 Processed: {results['processed_count']} images")
        print(f"❌ Failed: {results['failed_count']} images")
        print(f"📁 Output directory: {args.output_dir}")
        print(f"📄 Metadata saved: {os.path.join(args.output_dir, 'equirectangular_metadata.json')}")
        
        if results['errors']:
            print(f"\n⚠️  Errors encountered:")
            for error in results['errors']:
                print(f"   - {error}")
    
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 