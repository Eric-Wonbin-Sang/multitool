import pyzill
import json
import requests
from pyzill.details import headers
from curl_cffi import requests
from pyzill.parse import parse_body_home


# property_url="https://www.zillow.com/homedetails/858-Shady-Grove-Ln-Harrah-OK-73045/339897685_zpid/"
property_url='https://www.zillow.com/apartments/alhambra-ca/88-at-alhambra-place/CjvgqP/'

# headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
# response = requests.get(url=property_url, headers=headers)

data = pyzill.get_from_deparment_url(property_url)
jsondata = json.dumps(data)
print(jsondata)

# # response = requests.get(url=property_url, headers=headers, proxies=None, impersonate="chrome124")

# response.raise_for_status()
# data = parse_body_home(response.content)
# print(data)

# proxy_url = pyzill.parse_proxy("[proxy_ip or proxy_domain]","[proxy_port]","[proxy_username]","[proxy_password]")

# proxies = {"http": proxy_url, "https": proxy_url} if proxy_url else None

# data = pyzill.get_from_home_url(property_url)
# # jsondata = json.dumps(data)
# # print(jsondata)
# # f = open("details.json", "w")
# # f.write(jsondata)
# # f.close()


# import json

# # Load the JSON data
# with open('details.json', 'r') as file:
#     data = json.load(file)

# # Extract all unitNumber values
# unit_numbers = []
# for floor_plan in data.get('floorPlans', []):
#     for unit in floor_plan.get('units', []):
#         unit_number = unit.get('unitNumber')
#         if unit_number:
#             unit_numbers.append(unit_number)

# print(unit_numbers)