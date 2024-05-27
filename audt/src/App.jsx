import { useState } from 'react'
import React from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
//import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import $, { each } from 'jquery';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function App() {
    const [csv_data, setCsvData] = useState([[]]);
    const [filtered_csv_data, setFilteredCsvData] = useState([[]]);
    const [headers, setHeaders] = useState([]);
    const [img_dict, setImgDict] = useState({});
    const [decklist, setDecklist] = useState([]);
    function updateCount(id, count) {
        let temp_csv_data = csv_data.map((row, index) => row.map((value, index2) => (row[0] == id && index2 == 1) ? count : value));
        setCsvData(temp_csv_data);
        setFilteredCsvData(filtered_csv_data.map((row, index) => row.map((value, index2) => (row[0] == id && index2 == 1) ? count : value)));

        updateDecklist(temp_csv_data);
    }

    function downloadCSV() {
        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n" 
            + csv_data.map(e => e.slice(1).join(",")).join("\n");
        var encodedUri = encodeURI(csvContent);
        var aDownloadLink = document.createElement('a');
        aDownloadLink.download = $("#filename").val() + ".csv";
        aDownloadLink.href = encodedUri;
        aDownloadLink.click();
    }

    function downloadImage() {
        const canvas = document.getElementById("final_output");
        const ctx = canvas.getContext("2d");
        let countdown = decklist.length;

        decklist.forEach((key, index) => {
            const img = document.createElement('img');
            img.addEventListener("load", () => {
                ctx.drawImage(img, 750 * (index % 10), 1050 * (Math.floor(index / 10)));
                countdown--;
            });
            img.src = img_dict[decklist[index]] ?? "spacer.png"; 
        });

        function checkComplete() {
            if (countdown == 0) {
                var dataURL = canvas.toDataURL("image/png");
                var aDownloadLink = document.createElement('a');
                aDownloadLink.download = $("#filename").val() + ".png";
                aDownloadLink.href = dataURL;
                aDownloadLink.click();
            } else {
                setTimeout(checkComplete, 100);
            }
        }

        checkComplete();
        
    }

    function updateDecklist(data) {
        let temp_decklist = [];
        data.forEach((row) => {
            for (let i = 0; i < row[1]; i++) {
                temp_decklist.push(row[0]);
            }
        })
        setDecklist(temp_decklist);
    }
    function updateFilters() {
        let faction_list = $('#faction_list').val();
        let type_list = $('#type_list').val();
        setFilteredCsvData(csv_data.filter((row) => {
            return (type_list == undefined || type_list.includes(row[3]) || type_list.length == 0) && (faction_list == undefined || faction_list.includes(row[4]) || faction_list.length == 0)
        }));
    }

    const gallery = Object.values(import.meta.glob('/AU_Card_Images/*/*.{png,jpg,jpeg,PNG,JPEG}', { eager: true, as: 'url' }))

    if (img_dict["0"] == null) {
        let temp_img_dict = {};
        gallery.forEach((name) => {
            temp_img_dict[name.substring(name.lastIndexOf("_") + 1, name.lastIndexOf("."))] = name;
        })
        setImgDict(temp_img_dict);
    }

    function load_csv(data) {
        var allTextLines = data.split(/\r\n|\n/);
        var _headers = allTextLines[0].split(',');
        setHeaders(_headers);
        var lines = [];

        for (var i = 1; i < allTextLines.length; i++) {
            var data = allTextLines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
            var tarr = [];
            tarr.push(i - 1)
            for (var j = 0; j < _headers.length; j++) {
                tarr.push(data[j]); //headers[j] + ":" + 
            }
            lines.push(tarr);
        }
        setCsvData(lines);
        setFilteredCsvData(lines);
        updateDecklist(lines);
    }

    if (csv_data.length < 2)
        $.ajax({
            type: "GET",
            url: "AU_Card_Images/Card_Data.csv",
            dataType: "text",
            success: load_csv
        });

    return (
        <>
            <h1>AU Deckbuilder</h1>
            <Container fluid>
                <Row>
                    <Col>
                        <h2>Import CSV</h2>
                        <Form.Control size="lg" name="file" type="file" onChange={function (e) {
                            let _file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                load_csv(e.target.result);
                            };
                            reader.readAsText(_file);
                        }
                        } />
                        <h2>Filters</h2>
                        <Form>
                            <h3>Faction</h3>
                            <Form.Select id="faction_list" multiple htmlSize={7} onClick={updateFilters}>
                                <option value="General">General</option>
                                <option value="Arcan">Arcan</option>
                                <option value="Bruct">Bruct</option>
                                <option value="Diablo">Diablo</option>
                                <option value="Grim">Grim</option>
                                <option value="Myst">Myst</option>
                                <option value="Rula">Rula</option>
                            </Form.Select>
                            <h3>Type</h3>
                            <Form.Select id="type_list" multiple htmlSize={4} onClick={updateFilters}>
                                <option value="Unit">Unit</option>
                                <option value="Spell">Spell</option>
                                <option value="Structure">Structure</option>
                                <option value="Commander">Commander</option>
                            </Form.Select>
                        </Form>
                        <h2>Downloads</h2>
                        <Stack direction="horizontal" gap={0}>
                            <Form.Control placeholder="File Name" style={{maxWidth: "60%"}} id="filename" size="lg" type="text"></Form.Control>
                            <div className="p-2"><Button onClick={ downloadCSV }>Download as CSV</Button></div>
                            <div className="p-2"><Button onClick={downloadImage }>Download as Image</Button></div>
                        </Stack>
                    </Col>
                    <Col>
                        <h2>Preview</h2>
                        <Table size="sm">
                            <tbody>
                                {Array.from(Array(6).keys()).map((_, row) => (
                                    <tr>
                                        {Array.from(Array(10).keys()).map((_, col) => (
                                            <td><Image style={{ maxWidth: "100%" }} src={img_dict[decklist[row * 10 + col]] ?? "spacer.png"}></Image></td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <canvas id="final_output" width="7500" height="6300" hidden/>
                    </Col>
                </Row>
            </Container>
            
            <h2>Table</h2>
            <Table responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        {headers.map((value, index) => (
                            <th key={index}>{value}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filtered_csv_data.map((row_value, index) => (
                        <tr>
                            
                            {row_value.map((value, index2) => (
                                <td key={index2}>{((index2 != 1) ? value : (<input style={{ "maxWidth": "50px" }} type="number" value={value} onChange={e => updateCount(row_value[0], e.target.value)} />))}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
            
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <p>
                    
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
            
        </>
    )
}

export default App
