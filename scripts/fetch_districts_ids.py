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

