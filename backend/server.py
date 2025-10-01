from flask import Flask, request, jsonify
from flask_cors import CORS
import debugpy
from bs4 import BeautifulSoup
import os
from dataclasses import dataclass
from typing import List


debug_port = 4567
if os.environ.get("FLASK_DEBUG") == "1":
    try:
        debugpy.listen(("localhost", debug_port))
        print(f"Python debugger attached on port {debug_port}")
    except Exception as e:
        print(f"Debug attach failed: {e}")


app = Flask(__name__)
CORS(app, supports_credentials=True)


@app.route('/is_alive', methods=['GET'])
def is_alive():
    return jsonify({'message': "I'm alive!"})


@app.route('/process', methods=['POST'])
def process():
    data = request.json
    # do something with data
    result = {'message': 'Processed!', 'input': data}
    return jsonify(result)


@app.route('/zillow/get_listings', methods=['POST'])
def get_listings():
    data = request.json

    html = data['html']
    soup = BeautifulSoup(html, 'html.parser')
    
    # container that has the ul and li elems
    container_class = 'photo-cards'
    ul_elem = soup.find('ul', class_=container_class)

    selectors = []
    for i, li_elem in enumerate(ul_elem.find_all('li')):
        if not (div := li_elem.find('div', class_='property-card-data')):
            continue
        classes = div.get('class', [])
        class_selector = "." + ".".join(classes)
        selectors.append(f".{container_class} li:nth-of-type({i + 1}) {class_selector}")
    return jsonify({'selectors': selectors})


@dataclass
class Unit:
    number: str = None


@dataclass
class Building:

    name: str = None
    address: str = None
    units: List[Unit] = None


# @dataclass
# class Listing:
    

@app.route('/zillow/get_listing_details', methods=['POST'])
def get_listing_details():
    data = request.json

    url = data['url']
    listing_html = data['listing_html']
    listing_data = data['listing_data']
    unit_data = data['unit_data']




    # listingHtml = data['listingHtml']
    # unitHtmls = data['unitHtmls']
    # soup = BeautifulSoup(listingHtml, 'html.parser')

    # listing_card_class = 'layout-container-desktop'
    # listing_card_div = soup.find('div', class_=listing_card_class)

    # building = Building(
    #     name = listing_card_div.find('h1', attrs={'data-test-id': 'bdp-building-title'}).text,
    #     address = listing_card_div.find('h2', attrs={'data-test-id': 'bdp-building-address'}).text,
    # )

    # unit_container = listing_card_div.find('div', attrs={'data-test-id': 'bdp-property-card-container'})

    # unit_container.find_all('article')

    listingData = None
    closeSelector = None

    return jsonify({
        'listingData': listingData,
        'closeSelector': closeSelector,
    })


def main():
    app.run(port=5000, debug=True)


if __name__ == '__main__':
    main()
