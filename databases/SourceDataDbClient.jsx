import { PLATFORM_KEYS } from "../src/Rules";


class SourceDataDbClient {

    static PLATFORM_TO_PARSERS = {
        [PLATFORM_KEYS.ZILLOW]: (data) => {

            const { platform, listingUrl, listingHtml, listingData, unitData } = data;

            let parsedListingHtml = null;
            if (listingHtml) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(listingHtml, 'text/html');
                const div = doc.querySelector('div.layout-container-desktop');
                if (div) {
                    const tagsToRemove = ['g', 'path', 'script', 'svg', 'footer'];
                    tagsToRemove.forEach((tag) => {
                      div.querySelectorAll(tag).forEach((el) => el.remove());
                    });
                    parsedListingHtml = div ? div.outerHTML : null;
                }
            }
            let parsedListingData = {};
            if (listingData) {
                parsedListingData = listingData?.['response']?.['building_info'];
            }
            let parsedUnitData = null;
            if (unitData) {
                parsedUnitData = unitData?.['response']?.['data'];
            }

            return {
                platform,
                listingUrl,
                listingHtml: parsedListingHtml,
                listingData: parsedListingData,
                unitData: parsedUnitData,
                wasProcessed: false,
            };
        }
    }

    insertFromRawData = async (data) => {
        const { platform } = data;
        const parser = SourceDataDbClient.PLATFORM_TO_PARSERS[platform];
        let sourceData = null;
        try {
            sourceData = parser(data);
            console.log(`SourceDataDbClient - inserting:`, sourceData);
            return await this.insert(sourceData);
        }
        catch (error) {
            console.log(`SourceDataDbClient - could not use ${platform} parser with data:`, error, data);
        }
    }
    
    insert = async (buildingData) => {
        return await window.electron.invoke('sourceDataDb:insert', buildingData);
    }
}


export default new SourceDataDbClient();
