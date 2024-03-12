# scraper.py
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import pandas as pd


PAGE_NUMBER = 5

def fetch_table_data():
    url = f'https://mcla.us/schedule/2024-03?page={PAGE_NUMBER}'  # Change to the actual URL you need to scrape
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


def convert_to_dataframe(table_data):
    # Assuming table_data is a list of rows, and each row is a list of cell values
    table_data.pop(0)  # Remove the first row which contains the headers
    table_data = [row[1:] for row in table_data]
    dataframe = pd.DataFrame(table_data)
    dataframe.to_csv('filename.csv', index=False)
    return dataframe