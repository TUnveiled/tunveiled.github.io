import { useState, useEffect } from 'react'
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import $, { each } from 'jquery';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Button from 'react-bootstrap/Button';
import defaultCSV from '/AU_Card_Images/Card_Data.csv?url';
import spacer from '/spacer.png?url';
import reactStringReplace from 'react-string-replace';

function App() {
    const [csv_data, setCsvData] = useState([[]]);
    const [filtered_csv_data, setFilteredCsvData] = useState([[]]);
    const [headers, setHeaders] = useState([]);
    const [img_dict, setImgDict] = useState({});
    const [decklist, setDecklist] = useState([]);
    const gallery = Object.values(import.meta.glob('/AU_Card_Images/*/*.png', { eager: true, query: '?url', import: 'default' }));


    // Controller Functions
    function updateCount(id, count) { // change the count associated with a specific card ID
        let temp_csv_data = csv_data.map((row, index) => row.map((value, index2) => (row[0] == id && index2 == 1) ? count : value));
        setCsvData(temp_csv_data);
        setFilteredCsvData(filtered_csv_data.map((row, index) => row.map((value, index2) => (row[0] == id && index2 == 1) ? count : value)));
        updateDecklist(temp_csv_data);
    }
    function downloadCSV() { // Convert decklist into CSV format and download
        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n" 
            + csv_data.map(e => e.slice(1).join(",")).join("\n");
        var encodedUri = encodeURI(csvContent);
        var aDownloadLink = document.createElement('a');
        aDownloadLink.download = $("#filename").val() + ".csv";
        aDownloadLink.href = encodedUri;
        aDownloadLink.click();
    }
    function downloadImage() { // Draw TTS Custom Deck Image
        // Set up the canvas fr drawing
        const canvas = document.getElementById("final_output");
        const ctx = canvas.getContext("2d");
        let countdown = decklist.length;

        // Draw each image onto the canvas
        decklist.forEach((key, index) => {
            const img = document.createElement('img');
            img.addEventListener("load", () => {
                ctx.drawImage(img, 750 * (index % 10), 1050 * (Math.floor(index / 10)));
                countdown--;
            });
            img.src = img_dict[decklist[index]] ?? spacer; 
        });

        // Wait for each image to be drawn, then download the canvas as a PNG
        let checkComplete = function () {
            if (countdown == 0) {
                var dataURL = canvas.toDataURL("image/png");
                var aDownloadLink = document.createElement('a');
                aDownloadLink.download = $("#filename").val() + ".png";
                aDownloadLink.href = dataURL;
                aDownloadLink.click();
            } else {
                setTimeout(checkComplete, 50);
            }
        }

        checkComplete();
        
    }
    function updateDecklist(data) { // Create the decklist array
        let temp_decklist = [];
        data.forEach((row) => {
            for (let i = 0; i < row[1]; i++) {
                temp_decklist.push(row[0]);
            }
        })
        setDecklist(temp_decklist);
    }
    function updateFilters(_data) { // Filter the list
        let faction_list = $('#faction_list').val();
        let type_list = $('#type_list').val();
        if (_data === null) _data = csv_data;
        setFilteredCsvData(_data.filter((row) => {
            return (type_list == undefined || type_list.includes(row[3]) || type_list.length == 0) && (faction_list == undefined || faction_list.includes(row[4]) || faction_list.length == 0)
        }));
    }
    function load_csv(data) { // convert CSV input into array
        // Grab headers and rows
        var allTextLines = data.split(/\r\n|\n/);
        var _headers = allTextLines[0].replace(/\s/g, String.fromCharCode(160)).split(',');
        setHeaders(_headers);
        var lines = [];

        // Create each row array
        for (var i = 1; i < allTextLines.length; i++) {
            var data = allTextLines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
            var tarr = [];
            tarr.push(i - 1)
            for (var j = 0; j < _headers.length; j++) {
                if (j == 1) data[j] = data[j].replace(/\s/g, String.fromCharCode(160));
                tarr.push(data[j]);
            }
            lines.push(tarr);
        }
        setCsvData(lines);
        updateFilters(lines);
        updateDecklist(lines);
    }
    function format_cell(value, index, row) {
        if (value == undefined)
            return "";
        switch (index) {
            case 1:
                return (<input style={{ "maxWidth": "50px" }} type="number" value={value} onChange={(e) => { updateCount(row_value[0], e.target.value) }} />);
                break;
            case 2:
                return (
                    <OverlayTrigger placement="right" overlay={<Tooltip><Image style={{ maxWidth: "100%" }} src={img_dict[row[0]]}/></Tooltip>}>
                        <a href={img_dict[row[0]]} target="_blank">{value}</a>
                    </OverlayTrigger>
                )
                break;
            case (parseInt(Object.keys(headers).find(key => headers[key] === "effect")) + 1):
                if (value.charAt(0) === '"')
                    value = value.substring(1, value.length - 1);
                value = value.replace(/<br\s*[\/]?>/gi, " _ ");
                value = reactStringReplace(value, '<<!mana>>', (match, i) => (<Image style={{ "maxHeight": "20px" }} src="mana.png"/>));
                value = reactStringReplace(value, '<<!gold>>', (match, i) => (<Image style={{ "maxHeight": "20px" }} src="gold.png"/>));
                return value;
                break;
            default:
                return value;
        }
        
    }

    // Perform First Time Setup
    useEffect(() => {
        // load images
        let temp_img_dict = {};
        gallery.forEach((name) => {
            // Determine the ID of each card from Image URLs
            if (import.meta.env.PROD) { // Image URLs are different on Production
                let endIndex = name.lastIndexOf(".") - 9;
                let startIndex = name.substring(0, endIndex).lastIndexOf("_") + 1;
                temp_img_dict[name.substring(startIndex, endIndex)] = name;
            }
            else {
                temp_img_dict[name.substring(name.lastIndexOf("_") + 1, name.lastIndexOf("."))] = name;
            }
        })
        setImgDict(temp_img_dict);

        // Load default Card Data
        $.ajax({
            type: "GET",
            url: defaultCSV,
            dataType: "text",
            success: load_csv
        });
    }, []);

    return (
        <>
            <div>
                <h1>AU Deckbuilder</h1>
                <hr className="hr" />
            </div>
            <Container fluid>
                <Row>
                    <Col lg={5}>
                        <h2>Instructions</h2>
                        <ul>
                            <li>Import a CSV or scroll down to the <a href="#table">Table</a> to get started!</li>
                            <li>Use the filters to help find the cards you want to add in the table. Use ctrl-click to select multiple.</li>
                            <li>Give your deck a name and save it as a CSV to edit it later or as a PNG to import it right into Tabletop Simulator!</li>
                            <li>Import into TTS using Objects->Components->Cards->Custom Deck with Width 10, Height 6, and Back is Hidden.  Remember to select the correct Number (of cards) as well.</li>
                        </ul>
                        <hr className="hr" />
                        <h2>Helpful Links</h2>
                        <ul>
                            <li><a href="https://docs.google.com/document/d/1ugf1jPtwdqVR7T10WZrzN0rqWBDUZOmKxP2Rj-eh0O4/edit?usp=sharing" target="_blank">Game Rules</a></li>
                            <li><a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3252480722" target="_blank">Game Board</a></li>
                            <li><a href={defaultCSV} target="_blank">CSV Template</a></li>
                        </ul>
                        <hr className="hr" />
                        <h2>Import CSV</h2>
                        <Form.Control size="lg" name="file" type="file" 
                            onChange={function (e) {
                                let _file = e.target.files[0];
                                let _form = e.target;
                                const reader = new FileReader();
                                reader.onload = (e2) => { load_csv(e2.target.result); _form.value = null; };
                                reader.readAsText(_file);
                            }}
                        />
                        <hr className="hr" />
                        <h2>Filters</h2>
                        <Container fluid>
                            <Row>
                                <Col>
                                    <h4>Faction</h4>
                                    <Form.Select id="faction_list" multiple htmlSize={7} onClick={() => updateFilters(csv_data)}>
                                        <option value="General">General</option>
                                        <option value="Arcan">Arcan</option>
                                        <option value="Bruct">Bruct</option>
                                        <option value="Diablo">Diablo</option>
                                        <option value="Grim">Grim</option>
                                        <option value="Myst">Myst</option>
                                        <option value="Rula">Rula</option>
                                    </Form.Select>
                                </Col>
                                <Col>
                                    <h4>Type</h4>
                                    <Form.Select id="type_list" multiple htmlSize={7} onClick={() => updateFilters(csv_data)}>
                                        <option value="Unit">Unit</option>
                                        <option value="Spell">Spell</option>
                                        <option value="Structure">Structure</option>
                                        <option value="Commander">Commander</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                        </Container>
                        <hr className="hr" />
                        <h2>Downloads</h2>
                        <Stack direction="horizontal" gap={0}>
                            <Form.Control placeholder="File Name" id="filename" size="lg" type="text"></Form.Control>
                            <div className="px-1"><Button onClick={downloadCSV}>CSV&nbsp;Export</Button></div>
                            <div className="px-1"><Button onClick={downloadImage}>PNG&nbsp;Export</Button></div>
                        </Stack>

                    </Col>
                    <Col lg={7}>
                        <h2>Preview</h2>
                        <Table size="sm">
                            <tbody>
                                {Array.from(Array(6).keys()).map((_, row) => (
                                    <tr>
                                        {Array.from(Array(10).keys()).map((_, col) => (
                                            <td><Image style={{ maxWidth: "100%" }} src={img_dict[decklist[row * 10 + col]] ?? spacer}></Image></td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <canvas id="final_output" width="7500" height="6300" hidden />
                    </Col>
                </Row>
            </Container>

            <hr className="hr" />
            <h2 id="table">Table</h2>
            <Table striped bordered hover >
                <thead style={{ position: "sticky", top: "-1px" }}>
                    <tr >
                        <th >ID</th>
                        {headers.map((value, index) => (
                            <th key={index}>{value}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filtered_csv_data.map((row_value, index) => (
                        <tr>

                            {row_value.map((value, index2) => (
                                <td key={index2}>{format_cell(value, index2, row_value)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    )
}

export default App
