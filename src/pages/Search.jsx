import { Button } from "@mui/material"
import { WebviewComponent } from "../common/WebviewComponent"
import styles from './Search.module.css';
import { useEffect, useRef, useState } from "react";
import { BackendApi } from "../BackendApi";
import { MESSAGE_CHANNELS, WebviewEvent, WebviewHelper } from "../common/WebviewHelper";
import sourceDataDbClient from "../../databases/SourceDataDbClient";
import { PLATFORM_KEYS } from "../Rules";
import { StyledButton } from "../common/StyledElements";


const PLATFORMS = {
    [PLATFORM_KEYS.ZILLOW]: {
        display: 'Zillow',
        icon: '',
        // url: 'https://www.zillow.com/',
        url: `https://www.zillow.com/homes/?searchQueryState=%7B%22filterState%22%3A%7B%22isTownhouse%22%3A%7B%22value%22%3Afalse%7D%2C%22isLotLand%22%3A%7B%22value%22%3Afalse%7D%2C%22isManufactured%22%3A%7B%22value%22%3Afalse%7D%2C%22isMultiFamily%22%3A%7B%22value%22%3Afalse%7D%2C%22isApartment%22%3A%7B%22value%22%3Atrue%7D%2C%22isCondo%22%3A%7B%22value%22%3Atrue%7D%2C%22isSingleFamily%22%3A%7B%22value%22%3Afalse%7D%2C%22isApartmentOrCondo%22%3A%7B%22value%22%3Atrue%7D%2C%22isRecentlySold%22%3A%7B%22value%22%3Afalse%7D%2C%22isPreMarketPreForeclosure%22%3A%7B%22value%22%3Afalse%7D%2C%22isPreMarketForeclosure%22%3A%7B%22value%22%3Afalse%7D%2C%22isForRent%22%3A%7B%22value%22%3Atrue%7D%2C%22isForSaleByAgent%22%3A%7B%22value%22%3Afalse%7D%2C%22isForSaleByOwner%22%3A%7B%22value%22%3Afalse%7D%2C%22isAuction%22%3A%7B%22value%22%3Afalse%7D%2C%22isComingSoon%22%3A%7B%22value%22%3Afalse%7D%2C%22isForSaleForeclosure%22%3A%7B%22value%22%3Afalse%7D%2C%22isNewConstruction%22%3A%7B%22value%22%3Afalse%7D%2C%22sortSelection%22%3A%7B%22value%22%3A%22priorityscore%22%7D%7D%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A50677%7D%5D%2C%22usersSearchTerm%22%3A%22Alhambra%20CA%20apartments%22%7D&category=SEMANTIC`,
    },
    [PLATFORM_KEYS.REALTOR_COM]: {
        display: 'Realtor.com',
        icon: '',
        url: '',
    },
    // [PLATFORM_KEYS.APARTMENTS_COM]: {
    //     display: 'Apartments.com',
    //     icon: '',
    //     url: '',
    // },
    // [PLATFORM_KEYS.STREET_EASY]: {
    //     display: 'Street Easy',
    //     icon: '',
    //     url: '',
    // },
}

class ZillowWebviewHelper extends WebviewHelper {

    static ZILLOW_EVENT_KEYS = {
        LISTINGS_CAPTURED: 'listings-captured',
        UNITS_CAPTURED: 'units-captured',
    }

    static ZILLOW_EVENTS = {
        [ZillowWebviewHelper.ZILLOW_EVENT_KEYS.LISTINGS_CAPTURED]: new WebviewEvent({
            targetMessageChannel: MESSAGE_CHANNELS.BEACON_CHANNEL,
            targetUrl: '/click/z_prod_web/',
            responseCheck: (response) => "building_info" in response,
        }),
        [ZillowWebviewHelper.ZILLOW_EVENT_KEYS.UNITS_CAPTURED]: new WebviewEvent({
            targetMessageChannel: MESSAGE_CHANNELS.FETCH_CHANNEL,
            targetUrl: 'operationName=RentalCostAndFeesBuildingQuery',
        }),
    }

    scrollThroughListings = async ({ scrollStep = 500, delay = 20 } = {}) => {
        return await this.scrollThroughElem({ selector: '.search-page-list-container', scrollStep, delay });
    }

    waitForListingsEvent = async () => {
        return await this.waitForEvent({ targetEvent: ZillowWebviewHelper.ZILLOW_EVENTS[ZillowWebviewHelper.ZILLOW_EVENT_KEYS.LISTINGS_CAPTURED] });
    }

    waitForUnitsEvent = async () => {
        return await this.waitForEvent({ targetEvent: ZillowWebviewHelper.ZILLOW_EVENTS[ZillowWebviewHelper.ZILLOW_EVENT_KEYS.UNITS_CAPTURED] });
    }

    static UNIT_ARTICLE_SELECTOR = 'div[data-test-id="bdp-property-card-container"] article';

    doUnitsExist = async () => {
        const articleSelector = ZillowWebviewHelper.UNIT_ARTICLE_SELECTOR;
        try {
            await this.waitForElement({ selector: articleSelector });
            return true;
        }
        catch (error) {
            return false;
        }
    }

    getUnitData = async () => {

        const articleSelector = ZillowWebviewHelper.UNIT_ARTICLE_SELECTOR;

        const unitSelectors = await this.runJsInWebview(
            `
            (
                () => {
                    console.log('articleSelector:', '${articleSelector}');
                    const articles = document.querySelectorAll('${articleSelector}');
                    console.log('articles:', articles);
                    return Array.from(articles).map((_, idx) => \`${articleSelector}:nth-of-type(\${idx + 1}) div\`);
                }
            )();
            `
        );
        const unitSelector = unitSelectors[0];
        const unitDataPromise = this.waitForUnitsEvent();
        this.clickBySelector(unitSelector);
        const unitData = await unitDataPromise;
        return unitData;
    }
}


const ZillowWebview = (props) => {

    const { cancelExportRef, exportListings, setExportListings } = props;

    const platform = PLATFORMS[PLATFORM_KEYS.ZILLOW];

    const webviewRef = useRef(null);
    const webviewHelper = new ZillowWebviewHelper({ webviewRef });

    const isCanceled = () => {
        if (!cancelExportRef.current) return false;
        cancelExportRef.current = false;
        setExportListings(false);
        return true;
    }

    const processListings = async (listingSelectors) => {
        // click on each selector, get html, and close popup

        for (let selector of listingSelectors) {
            console.log(`selector:`, selector);

            const listingDataPromise = webviewHelper.waitForListingsEvent();
            webviewHelper.clickBySelector(selector);
            await webviewHelper.waitForElement({ selector: 'div.layout-container-desktop' });
            const listingData = await listingDataPromise;
            
            console.log(`listingData:`, listingData);

            if (isCanceled()) return;

            try {
                const listingUrl = await webviewHelper.getUrl();
                console.log(`Listing URL:`, listingUrl);
                const listingHtml = await webviewHelper.getHtml();
                console.log(`Listing Popup HTML:`, listingHtml);

                let unitData = null;
                if (await webviewHelper.doUnitsExist()) {
                    unitData = await webviewHelper.getUnitData();
                    console.log(`Unit Data:`, unitData);

                    // Go back to the main listings page
                    console.log(`Clicking back button to go back to listing popup.`);
                    const backToListingPopopSelector = 'button[data-test-id="bdp-units-table-back-button"]';
                    await webviewHelper.waitForElement({ selector: backToListingPopopSelector });
                    await webviewHelper.clickBySelector(backToListingPopopSelector);
                    await webviewHelper.sleep(1_000);
                }

                console.log(`Saving source data...`);
                await sourceDataDbClient.insertFromRawData({
                    platform: PLATFORM_KEYS.ZILLOW,
                    listingUrl,
                    listingHtml,
                    listingData,
                    unitData,
                });

                console.log(`Clicking back button to go back to all listings.`);
                const backToSearchButtonSelector = 'div.layout-action-bar-container-desktop > div > nav > div:nth-child(1) > button';
                await webviewHelper.waitForElement({ selector: backToSearchButtonSelector });
                await webviewHelper.clickBySelector(backToSearchButtonSelector);
                await webviewHelper.sleep(1_000);
            }
            catch (error) {
                console.log(`Listing Capture Error: ${error}`);
            }
        }

        setExportListings(false);
    }

    const api = new BackendApi('http://localhost:5000');

    useEffect(
        () => {

            if (!exportListings) return;

            console.log(`loadData triggered`);

            const runScript = async () => {
                await webviewHelper.injectFetchListener();
                await webviewHelper.injectBeaconListener();
                // scroll through listings to load them
                await webviewHelper.scrollThroughListings();
                const html = await webviewHelper.getHtml();
                // get all listing elem selectors
                const data = await api.getListingSelectors(html);
                const listingSelectors = data.selectors;

                // await processListings(listingSelectors.slice(0, 2));
                // switch to different page
            }
            runScript();
        },
        [exportListings]
    );

    return (
        <WebviewComponent
            webviewRef={webviewRef}
            url={platform.url}
        />
    );
}


const FunctionBar = (props) => {
    
    const { cancelExportRef, exportListings, setExportListings } = props;

    const isExportDisabled = exportListings;
    const isCancelDisabled = !exportListings;

    return (
        <div className={styles.function_bar}>
            <StyledButton
                variant="contained"
                size="small"
                onClick={() => setExportListings(true)}
                disabled={isExportDisabled}
            >
                Export listings
            </StyledButton>
            <StyledButton
                variant="contained"
                size="small"
                disabled={isCancelDisabled}
                onClick={
                    () => {
                        cancelExportRef.current = true;
                        setExportListings(false);
                    }
                }
            >
                Cancel
            </StyledButton>
        </div>
    );
}


const SearchPage = (props) => {

    const [exportListings, setExportListings] = useState(false);

    const cancelExportRef = useRef(false);

    // useEffect(
    //     () => {
    //         if (exportListings) setExportListings(false);
    //     },
    //     [exportListings]
    // );

    return (
        <div className={styles.content}>
            <FunctionBar cancelExportRef={cancelExportRef} exportListings={exportListings} setExportListings={setExportListings} />
            <div className={styles.site_container}>
                <ZillowWebview cancelExportRef={cancelExportRef} exportListings={exportListings} setExportListings={setExportListings} />
            </div>
        </div>
    )
}


export default SearchPage;
