import pandas as pd
import numpy as np
import os


# Get path to assets folder
assets_path = os.path.join(os.path.dirname(__file__), '../assets/sheets')

# Get all folders inside assets folder
folders = os.listdir(assets_path)

# For each folder
for folder in folders:
    print('')
    print(folder)

    # Get path to folder
    folder_path = os.path.join(assets_path, folder)
    # Get all files inside folder
    files = os.listdir(folder_path)

    # Check if folder exists inside assets/json folder
    if not os.path.exists(f'assets/json/{folder}'):
        # If not, create it
        os.makedirs(f'assets/json/{folder}')

        if len(files) == 23:
            for file in files:
                file_path = os.path.join(folder_path, file)
                df = pd.read_csv(file_path)
                # Convert to json and save inside assets/json folder
                df.to_json(f'assets/json/{folder}/{file[:-4]}.json', orient='records')




