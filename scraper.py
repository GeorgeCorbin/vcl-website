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

# def fetch_match_data():
#     url = 'https://mcla.us/schedule/2024-03/'
#     response = requests.get(url)
#     soup = BeautifulSoup(response.content, 'html.parser')
#
#     # matches = []
#     # Assuming the data is in a table and each row represents a match
#     for match in soup.find_all('tr'):  # 'tr' for table rows, adjust selector based on actual structure
#         # if match.find('td', class_='date') is not None:
#         #     date = match.find('td', class_='date').text
#         # else:
#         #     date = "Not found"  # Or handle it in a way that suits your application
#         print(match)  # or use logging for a more robust solution
#         print (match.find('td', classmethod='Data'))
#
#         date = match.find('td', class_='Date').text
#         time = match.find('td', class_='Time').text
#         home = match.find('td', class_='Home').text
#         away = match.find('td', class_='Away').text
#         score = match.find('td', class_='Score').text
#         # Process and store this data
#
#
#     matches = [date, time, home, away, score]
#
#     return matches


# def calculate_time_until_match(match_datetime_str):
#     match_datetime = datetime.strptime(match_datetime_str, '%Y-%m-%d %H:%M')
#     current_datetime = datetime.now()
#     time_until_match = match_datetime - current_datetime
#
#     hours, remainder = divmod(time_until_match.seconds, 3600)
#     minutes, _ = divmod(remainder, 60)
#     return hours, minutes
