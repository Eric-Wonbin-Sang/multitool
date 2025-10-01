import { Button } from "@mui/material"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import styles from './NavBar.module.css';

export const NavBar = (props) => {

    const { allPages, currPage, setCurrPage } = props

    return (
        <div className={styles.container}>
            <div className={styles.left_group}>
                <h1 className={styles.app_name}>GINSANG</h1>
                <div className={styles.button_group}>
                    {
                        allPages.map(
                            (pageKey) => (
                                <Button
                                    key={pageKey}
                                    className={currPage == pageKey ? styles.active_page_button : ''}
                                    onClick={() => setCurrPage(pageKey)}
                                >
                                    {pageKey}
                                </Button>
                            )
                        )
                    }
                </div>
            </div>
            <div className={styles.right_group}>
                <AccountCircleIcon/>
            </div>
        </div>
    )
}
