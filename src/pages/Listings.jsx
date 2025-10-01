import styles from './Listings.module.css';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css'; // choose a theme
import { useState } from "react";
import { ModuleRegistry } from 'ag-grid-community';

import { ClientSideRowModelModule } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);


// export default function TableGrid() {
//     const [rowData] = useState([
//         { address: '1234 Test Address Street', bed: 2, bath: 1, price: 1_000_000 },
//         { address: '1234 Test Address Street', bed: 2, bath: 1, price: 1_000_000 },
//         { address: '1234 Test Address Street', bed: 2, bath: 1, price: 1_000_000 }
//     ]);

//     const [columnDefs] = useState([
//         { field: 'address' },
//         { field: 'bed' },
//         { field: 'bath' },
//         { field: 'price' }
//     ]);

//     return (
//         <div
//             className={`ag-theme-alpine ${styles.table}`}
//         // style={{ height: 400, width: '100%' }}
//         >
//             <AgGridReact
//                 rowData={rowData}
//                 columnDefs={columnDefs}
//             />
//         </div>
//     );
// }


export const Listings = (props) => {

    return (
        <div>
            <p>Search and add listings from the Search tab!</p>
        </div>
    );
}

