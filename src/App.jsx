import { useState } from 'react'
import { NavBar } from './common/NavBar'
import { PAGE } from './Rules';
import Search from './pages/Search';
import { Listings } from './pages/Listings';
import styles from './App.module.css';


const PAGE_TO_COMPONENT = {
    [PAGE.SEARCH]: Search,
    [PAGE.LISTINGS]: Listings,
};


function App() {

    const [currPage, setCurrPage] = useState(PAGE.SEARCH);

    const Page = () => {
        const component = PAGE_TO_COMPONENT[currPage];
        return component();
    }

    return (
        <div className={styles.screen}>
            <NavBar allPages={Object.keys(PAGE_TO_COMPONENT)} currPage={currPage} setCurrPage={setCurrPage}/>
            <div className={styles.app_content}>
                <Page />
            </div>
        </div>
    );
}


export default App;
