import { useState, useEffect } from 'react'
import React from 'react';
import Table from 'react-bootstrap/Table';
import Image from 'react-bootstrap/Image';
import spacer from '/spacer.png?url';
import Card from '/src/Card.jsx'

function CardGridView(props) {
    let table_id = props.table_id;
    let row_size = props.row_size;
    let model = props.model;
    let maxCards = props.maxCards ?? model.length;
    let data_dict = props.data_dict;
    let header_lookup = props.header_lookup;
    let size = props.size;
    let updateCount = props.updateCount;
    let getImg = props.getImg;
    let getID = props.getID;

    function getData(index) {
        if (data_dict) {
            return data_dict[model[index]];
        }
        else {
            return model[index];
        }
    }

    return (
        <Table size="sm" id={table_id}>
            <tbody>
                {Array.from(Array(Math.ceil(maxCards / row_size)).keys()).map((index1, row) => (
                    <tr key={index1}>
                        {Array.from(Array(row_size).keys()).map((index2, col) => (getImg(getID(getData(row * row_size + col) ?? {})) != null) ?
                            (
                                <td key={index2}>
                                    <Card
                                        src={getImg(getID(getData(row * row_size + col)))}
                                        count={getData(row * row_size + col)[header_lookup["Count"]]}
                                        updateCount={updateCount}
                                        name={getID(getData(row * row_size + col))}
                                        max={(["Commander", "Structure"].includes(getData(row * row_size + col)[header_lookup["type"]])) ? 1 : 3}
                                        size={size}
                                    />
                                </td>
                            )
                            :
                            (<td key={index2}><Image style={{ maxWidth: "100%" }} src={spacer} /></td>)
                        )}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

export default CardGridView;