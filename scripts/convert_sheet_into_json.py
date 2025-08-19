import pandas as pd
import numpy as np
import os


# Get path to assets folder
sheets_path = os.path.join(os.path.dirname(__file__), '../assets/sheets')
assets_path = os.path.join(os.path.dirname(__file__), '../assets')

# Get all folders inside assets folder
folders = os.listdir(sheets_path)

# For each folder
for folder in folders:
    print('')
    print(folder)

    # Get path to folder
    folder_path = os.path.join(sheets_path, folder)
    # Get all files inside folder
    files = os.listdir(folder_path)

    # Check if folder exists inside assets/json folder
    if not os.path.exists(assets_path + f'/json/{folder}'):
        # If not, create it
        os.makedirs(assets_path + f'/json/{folder}')

    for file in files:
        file_path = os.path.join(folder_path, file)
        df = pd.read_csv(file_path)
        # Convert to json and save inside assets/json folder
        df.to_json(assets_path + f'/json/{folder}/{file[:-4]}.json', orient='records')



