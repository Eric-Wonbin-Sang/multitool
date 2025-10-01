
class GinsangDatabase {

    async makeEntry(rawData) {

        const { listingUrl, listingHtml, listingData, unitData } = rawData;

        console.log(`listingUrl:`, listingUrl);
        console.log(`listingHtml:`, listingHtml);
        console.log(`listingData:`, listingData);
        console.log(`unitData:`, unitData);

        const parser = new DOMParser();
        const doc = parser.parseFromString(listingHtml, 'text/html');

        // Find the main listing card div
        const listingCardClass = 'layout-container-desktop';
        const listingCardDiv = doc.querySelector(`div.${listingCardClass}`);

        const id = crypto.randomUUID();
        const name = listingCardDiv.querySelector('h1[data-test-id="bdp-building-title"]').textContent;
        const address = listingCardDiv.querySelector('h2[data-test-id="bdp-building-address"]').textContent;
        const url = listingUrl;
        const type = null;

        building = {
            id: id,
            type: type,
            name: name,
            address: address,
            url: url,
            rawData: rawData,
        }

        units = [
            {
                bedCount: null,
                bathCount: null,
                sqFt: null,
            }
        ]


        // Insert building first
        //   const building = await window.electron.invoke('db:insert-building', buildingData);
        //   const buildingId = building._id;

        //   // Insert listings linked to the building
        //   const linkedListings = listingsData.map(listing => ({ ...listing, building_id: buildingId }));
        // await window.electron.invoke('db:insert-listings', linkedListings);

        return {  };
    }   

    async getBuildings() {
        return await window.electron.invoke('db:get-buildings');
    }

    async getListings(buildingId) {
        return await window.electron.invoke('db:get-listings', buildingId);
    }

    async deleteBuilding(buildingId) {
        return await window.electron.invoke('db:delete-building', buildingId);
    }

    async deleteListing(listingId) {
        return await window.electron.invoke('db:delete-listing', listingId);
    }
}


const db = new GinsangDatabase();
export default db;
