
class BaseApi {

    constructor(uri) {
        this.uri = uri;
    }

    doGetRequest = async (endpoint) => {
        let url = `${this.uri}/${endpoint}`;
        console.log(`Api.doGetRequest: ${url}`);
        const result = await fetch(
            url,
            {
                method: 'GET',
                credentials: 'include',
                headers: new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' }),
            }
        );
        return await result.json();
    }

    doPostRequest = async (endpoint, body = {}) => {
        let url = `${this.uri}/${endpoint}`;
        console.log(`Api.doPostRequest: ${url}`);
        const result = await fetch(
            url,
            {
                method: 'POST',
                credentials: 'include',
                headers: new Headers({ 'Content-Type': 'application/json', 'Accept': 'application/json' }),
                body: JSON.stringify(body),
            }
        );
        return await result.json();
    }
}


export class BackendApi extends BaseApi {

    getListingSelectors = async (html) => {
        return await this.doPostRequest('zillow/get_listings', {html: html})
    }

    getListingDetails = async (url, listingHtml, listingData, unitData) => {
        return await this.doPostRequest(
            'zillow/get_listing_details',
            {
                url: url,
                listing_html: listingHtml,
                listing_data: listingData,
                unit_data: unitData
            }
        );
    }
}
