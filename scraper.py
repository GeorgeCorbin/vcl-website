# scraper.py
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import pandas as pd


def fetch_table_data(month, page_number):
    url = f'https://mcla.us/schedule/2024-{month}?page={page_number}'  # Change to the actual URL you need to scrape
    response = requests.get(url)
    return response.text

def parse_table(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table')  # Adjust this if there are multiple tables or a specific id/class is needed

    data = []
    for row in table.find_all('tr'):
        cols = [ele.text.strip() for ele in row.find_all('td')]
        data.append(cols)
    return data

columns = ['Date', 'Time', 'Location', 'away_team_id', 'home_team_id', 'score']
def convert_to_dataframe(table_data):
    # Assuming table_data is a list of rows, and each row is a list of cell values
    table_data.pop(0)  # Remove the first row which contains the headers
    table_data = [row[1:] for row in table_data]
    # table_data = [row[:-1] for row in table_data]
    dataframe = pd.DataFrame(table_data)
    standardize_dataframe(dataframe)
    dataframe.columns = columns
    dataframe.to_csv('filename.csv', index=False)
    return dataframe

expected_num_columns = 6
def standardize_dataframe(df):
    current_num_columns = len(df.columns)
    if current_num_columns < expected_num_columns:
        # Calculate how many columns are missing
        missing_columns = expected_num_columns - current_num_columns

        # Add the missing columns filled with "N/A"
        for i in range(missing_columns):
            df[f'Column_{current_num_columns + i + 1}'] = "N/A"

    return df