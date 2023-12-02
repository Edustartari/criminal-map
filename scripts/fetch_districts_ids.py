import json
import os
from bs4 import BeautifulSoup

print('Fetching districts ids...')
# Get html districts_ids.html inside public folder
html_file = open('public/districts_ids.html', 'r')
html = html_file.read()

print('Parsing html...')
soup = BeautifulSoup(html, 'html.parser')
# Get all options inside select tag
options = soup.find_all('option')

districts = {}
# Iterate over options
for option in options:
    # Get id and name
    district_id = option['value']
    name = option.text
    # Add to dictionary
    districts[district_id] = name

print('Creating districts.json...')
with open('public/districts.json', 'w') as json_file:
    json.dump(districts, json_file)

# Close html file
html_file.close()

districts_list = []
# Open public/sp_map.svg file and get its content
svg_file = open('public/sp_map.svg', 'r')
svg = svg_file.read()

# Parse svg content
soup = BeautifulSoup(svg, 'html.parser')
# Get all paths inside svg
paths = soup.find_all('path')

# Find all paths with id attribute "path_xxx"
for path in paths:
    if path['id'].startswith('path_'):
        print(path)
        # Get id
        district_id = path['id'][5:]
        print(district_id)
        districts_list.append(district_id)

print(districts_list)