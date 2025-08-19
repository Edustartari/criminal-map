import pandas as pd
import numpy as np
import os

# We'll check each cell in each sheet
# IF decimal number has 3 digits after the comma, we'll add a zero after the comma
# Example: 6.159 -> 6159.0

# Get path to assets folder
sheets_path = os.path.join(os.path.dirname(__file__), '../assets/sheets')
assets_path = os.path.join(os.path.dirname(__file__), '../assets')

# Get all folders inside assets folder
folders = os.listdir(sheets_path)

# For each folder
for folder in folders:
    print('')
    print(folder)

    print('Fixing decimals...')
    # Get path to folder
    folder_path = os.path.join(sheets_path, folder)
    print('folder_path: ', folder_path)
    # Get all files inside folder
    files = os.listdir(folder_path)

    for file in files:
        file_path = os.path.join(folder_path, file)
        df = pd.read_csv(file_path)
        # Get each cell in each sheet
        for index, row in df.iterrows():
            for column in df.columns:
                # Check if cell is a float
                if isinstance(row[column], float):
                    # Check if cell has 3 digits after the comma
                    if len(str(row[column]).split('.')[1]) == 3:
                        # Add a zero after the comma
                        df.loc[index, column] = float(str(row[column]).replace('.', ''))
                    # Check if cell has 2 digits after the comma
                    elif len(str(row[column]).split('.')[1]) == 2:
                        # Add two zeros after the comma
                        df.loc[index, column] = float(str(row[column]).replace('.', '') + '0')
                    # Check if cell has 1 digit after the comma and the number is not 0
                    elif len(str(row[column]).split('.')[1]) == 1 and str(row[column]).split('.')[1] != '0':
                        # Add three zeros after the comma
                        df.loc[index, column] = float(str(row[column]).replace('.', '') + '00')

        # Save file at the same path
        df.to_csv(file_path, index=False)
        
        # Convert to json and save inside assets/json folder
        df.to_json(assets_path + f'/json/{folder}/{file[:-4]}.json', orient='records')




