import { useState, useEffect, useRef } from 'react'
import React from 'react';
import Table from 'react-bootstrap/Table';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

function CardTableView(props) {
    const [tablescale, setTablescale] = useState(1);
    const [outer_height, setOuterHeight] = useState("fit-content");
    const table = useRef(null);
    const outer_div = useRef(null);
    let filtered_csv_data = props.filtered_csv_data;
    let breakpointIndex = props.getBreakpointIndex();
    let headers = props.headers;
    let header_lookup = props.header_lookup
    let format_cell = props.format_cell;
    let getID = props.getID;

    let transform_style = {
        transition: "transform 0.5s ease-in",
        transformOrigin: "0 0",
        transform: `scale(${tablescale})`
    }

    function updateZoomBounds() {
        if (breakpointIndex > 1) {
            setTablescale(1);
            setOuterHeight("fit-content")
        }
        else if (table != null && outer_div != null) {
            setTablescale(outer_div.current.offsetWidth / table.current.offsetWidth);
            setOuterHeight(`${table.current.offsetHeight * outer_div.current.offsetWidth / table.current.offsetWidth+1}px`);
        }

    }

    useEffect(() => {
        if (!table.current || !outer_div.current) return;
        const tableObserver = new ResizeObserver(updateZoomBounds);
        const divObserver = new ResizeObserver(updateZoomBounds);
        tableObserver.observe(table.current);
        divObserver.observe(outer_div.current);
        return () => { tableObserver.disconnect(); divObserver.disconnect(); } // clean up 
    }, []);
    
    function getHeader() {
        switch (breakpointIndex) {
            case 0:
            case 1:
            case 2:
                let normalHeaders = headers.filter((a) => !["ID", "name", "Count", "effect"].includes(a))
                let topRow = [(<th rowSpan="3">Count</th>), (<th rowSpan="2">name</th>)];
                let middleRow = [];
                let bottomRow = [<th colSpan={normalHeaders.length / 2 + 2}>effect</th>];

                for (let i = 0; i < normalHeaders.length; i++) {
                    if (i % 2 == 0) {
                        topRow.push(<th>{normalHeaders[i]}</th>);
                    }
                    else {
                        middleRow.push(<th>{normalHeaders[i]}</th>);
                    }
                }

                if (topRow.length - 2 > middleRow.length)
                    middleRow.push(<th></th>);

                return (
                    <>
                        <tr className="doubleHeader">
                            {topRow}
                        </tr>
                        <tr className="doubleHeader">
                            {middleRow}
                        </tr>
                        <tr className="doubleHeader">
                            {bottomRow}
                        </tr>
                    </>
                );

                break;
            case 3:
                return (
                    <>
                        <tr className="doubleHeader">
                            {headers.map((value, index) => (index != header_lookup["effect"]) ? (<th rowSpan={index < 2 ? 2 : 1} key={index}>{value.replace(/\s/g, String.fromCharCode(160))}</th>) : <></>)}
                        </tr>
                        <tr className="doubleHeader">
                            <th colSpan={headers.length - 3}>effect</th>
                        </tr>
                    </>
                )
                break;
            case 4:
            case 5:
            default:
                return (
                    <tr >
                        {headers.map((value, index) => <th key={index}>{value.replace(/\s/g, String.fromCharCode(160))}</th>)}
                    </tr>
                )
                break;
        }
    }

    function getBody() {
        switch (breakpointIndex) {
            case 0:
            case 1:
            case 2:
                let normalHeaders = headers.filter((a) => !["ID", "name", "Count", "effect"].includes(a))
                let topRow = ["Count", "name"];
                let topRowspans = [3, 2];
                let middleRow = [];
                let bottomRow = ["effect"];

                for (let i = 0; i < normalHeaders.length; i++) {
                    if (i % 2 == 0) {
                        topRow.push(normalHeaders[i]);
                        topRowspans.push(1);
                    }
                    else {
                        middleRow.push(normalHeaders[i]);
                    }
                }

                if (topRow.length - 2 > middleRow.length)
                    middleRow.push("");

                return filtered_csv_data.map((row, index) => (
                    <>
                        <tr>
                            {topRow.map((value, col_index) => (
                                <td rowSpan={topRowspans[col_index]} key={`row1-${getID(row)}\\:${index}-col-${col_index}`}>{format_cell(row[header_lookup[value]], header_lookup[value], row, " ")}</td>
                            ))}
                        </tr>
                        <tr>
                            {middleRow.map((value, col_index) => (
                                <td key={`row2-${getID(row)}\\:${index}-col-${col_index}`}>{format_cell(row[header_lookup[value]], header_lookup[value], row)}</td>
                            ))}
                        </tr>
                        <tr>
                            <td colSpan={normalHeaders.length / 2 + 2} key={`row3-${getID(row)}\\:${index}-col-0`}>{format_cell(row[header_lookup[bottomRow[0]]], header_lookup[bottomRow[0]], row)}</td>
                        </tr>
                    </>
                ));

                break;
            case 3:
                return filtered_csv_data.map((row_value, index) => (<>
                    <tr key={`row1-${getID(row_value)}\\:${index}`}>
                        {row_value.map((value, index2) => (index2 != header_lookup["effect"]) ? (
                            <td rowSpan={index2 < 2 ? 2 : 1} key={`row1-${getID(row_value)}\\:${index}-col-${index2}`}>
                                {format_cell(value, index2, row_value)}
                            </td>) : <></>)
                        }
                    </tr>
                    <tr key={`row2-${getID(row_value)}\\:${index}`}>
                        <td colSpan={headers.length - 3} key={`row2-${getID(row_value)}\\:${index}-col-effect`}>
                            {format_cell(row_value[header_lookup["effect"]], header_lookup["effect"], row_value)}
                        </td>
                    </tr>
                </>));
                break;
            case 4:
            case 5:
            default:
                return filtered_csv_data.map((row_value, index) => (
                    <tr key={`row-${getID(row_value)}\\:${index}`}>
                        {row_value.map((value, index2) => (
                            <td key={`row-${getID(row_value)}\\:${index}-col-${index2}`}>
                                {format_cell(value, index2, row_value)}
                            </td>))
                        }
                    </tr>))
                break;
        }
    }

    return (
        <div style={{ width: "100%", overflowX: "auto", overflowY: "hidden", height: outer_height }} ref={outer_div}>
            <div style={transform_style }>
                    <Table bordered hover ref={table}>
                        <thead style={{ position: "sticky", top: "-1px" }}>
                            {getHeader()}
                        </thead>
                        <tbody>
                            {getBody()}
                        </tbody>
                    </Table>
               </div>
        </div>
    );
}

export default CardTableView;