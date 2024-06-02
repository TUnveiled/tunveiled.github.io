import { useState, useEffect } from 'react'
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '/src/App.css';
import $, { each } from 'jquery';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Button from 'react-bootstrap/Button';
import defaultCSV from '/AU_Card_Images/Card_Data.csv?url';
import spacer from '/spacer.png?url';
import mana from '/mana.png?url';
import gold from '/gold.png?url'
import target from '/target.png?url'
import left from '/left.png?url'
import right from '/right.png?url'
import reactStringReplace from 'react-string-replace';

function App() {
    const [csv_data, setCsvData] = useState([[]]);
    const [filtered_csv_data, setFilteredCsvData] = useState([[]]);
    const [headers, setHeaders] = useState([]);
    const [img_dict, setImgDict] = useState({});
    const [decklist, setDecklist] = useState([]);
    const [header_lookup, setHeaderLookup] = useState({});
    const [faction_list, setFactionList] = useState([]);
    const [type_list, setTypeList] = useState([]);
    const [tag_list, setTagList] = useState([]);
    const gallery = Object.values(import.meta.glob('/AU_Card_Images/*.png', { eager: true, query: '?url', import: 'default' }));
    const getImageKey = function (url) {
        let filename = url.substring(url.lastIndexOf("/")+1);
        let start = filename.indexOf("_") + 1;
        let end = start + filename.substring(start + 1).indexOf("_")+1;
        return decodeURI(filename.substring(start, end)).replace(" ", String.fromCharCode(160));
    }
    const getImg = function (key) {
        return img_dict[(key ?? "")
            .replace(/[\(\)']/g, "")
            .normalize('NFD').replace(/[a-z][\u0300-\u036f]/g, '')]
            ;
    }
    const getImgKeyHeaderIndex = function () { return header_lookup["name"] };


    // Controller Functions
    function updateCount(id, count) { // change the count associated with a specific card ID
        try {
            let temp_csv_data = csv_data.map((row, index) => row.map((value, index2) => (row[0] == id && index2 == header_lookup["Count"]) ? count : value));
            setCsvData(temp_csv_data);
            setFilteredCsvData(filtered_csv_data.map((row, index) => row.map((value, index2) => (row[0] == id && index2 == header_lookup["Count"]) ? count : value)));
            updateDecklist(temp_csv_data);
        } catch (e) {
            console.log(e);
            alert("Counting error")
        }
    }
    function downloadCSV() { // Convert decklist into CSV format and download
        try {
            let csvContent = "data:text/csv;charset=utf-8,"
                + headers.slice(1).join(",") + "\n"
                + csv_data.map(e => e.slice(1).join(",")).join("\n");
            var encodedUri = encodeURI(csvContent);
            var aDownloadLink = document.createElement('a');
            aDownloadLink.download = $("#filename").val() + ".csv";
            aDownloadLink.href = encodedUri;
            aDownloadLink.click();
        } catch (e) {
            console.log(e);
            alert("Error making CSV");
        }
    }
    function downloadImage() { // Draw TTS Custom Deck Image
        // Set up the canvas fr drawing
        try {
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
                img.src = getImg(decklist[index]) ?? spacer;
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
        } catch (e) {
            console.log(e);
            alert("Error making PNG.")
        }

    }
    function updateDecklist(data) { // Create the decklist array
        try {
            let temp_decklist = [];
            data.forEach((row) => {
                for (let i = 0; i < row[1]; i++) {
                    temp_decklist.push(row[getImgKeyHeaderIndex()]);
                }
            });
            setDecklist(temp_decklist);
        } catch (e) {
            console.log(e);
            alert("Error updating deck.")
        }
    }
    function updateFilters(_data) { // Filter the list
        try {
            let faction_list = $('#faction_list').val();
            let type_list = $('#type_list').val();
            let tag_list = $('#tag_list').val();
            if (_data === null) _data = csv_data;
            setFilteredCsvData(_data.filter((row) => {
                let type_match = (type_list == undefined || type_list.includes(row[header_lookup["type"]]) || type_list.length == 0);
                let faction_match = (faction_list == undefined || faction_list.includes(row[header_lookup["faction"]]) || faction_list.length == 0);
                let tag_match = (tag_list == undefined || tag_list.length == 0 || Object.keys(header_lookup).filter(header => header.includes("tag")).some(header => tag_list.includes(row[header_lookup[header]])));

                return type_match && ((faction_match && tag_match) || (faction_list.includes("Tag") && row[header_lookup["faction"]] != "Tag" && (faction_match || tag_match)));

            }));
        } catch (e) {
            console.log(e);
            alert("filtering error");
        }
    }
    function load_csv(data) { // convert CSV input into array
        try {
            // Grab headers and rows
            var allTextLines = data.split(/\r\n|\n/);
            let _headers = ["ID"].concat(allTextLines[0].split(','));
            let _header_lookup = Object.fromEntries(Object.entries(_headers).map(([key, value]) => [value, parseInt(key)]));
            setHeaders(_headers);
            setHeaderLookup(_header_lookup);

            var lines = [];

            // Create each row array
            for (var i = 1; i < allTextLines.length; i++) {
                var data = allTextLines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                if (data == null || data.length < 3) continue; // handle bad data
                var tarr = [];
                tarr.push(i - 1)
                for (var j = 0; j < _headers.length - 1; j++) {
                    if (j == 1) data[j] = data[j].replace(/\s/g, String.fromCharCode(160));
                    tarr.push(data[j]);
                }
                lines.push(tarr);
            }

            let _faction_list = [...new Set(lines.map((row) => row[_header_lookup["faction"]]))];
            let _type_list = [...new Set(lines.map((row) => row[_header_lookup["type"]]))];
            let _tag_list = [...new Set([].concat(Object.keys(_header_lookup).filter(header => header.includes("tag")).map(header => lines.map((row) => row[_header_lookup[header]]))).flat().filter(a => a != null))];

            setFactionList(_faction_list);
            setTypeList(_type_list);
            setTagList(_tag_list);
            setCsvData(lines);
            updateFilters(lines);
            updateDecklist(lines);
        } catch (e) {
            console.log(e);
            alert("Error reading CSV");
        }
    }
    function format_cell(value, index, row) {
        if (value == undefined)
            return "";
        switch (index) {
            case header_lookup["ID"]:
                return <div className="numeric">{value}</div>
            case header_lookup["Count"]:
                return (<Form.Control size="lg" style={{ "maxWidth": "100px", "padding": "20%" }} type="number"
                    min="0" max={(["Commander", "Structure"].includes(row[header_lookup["type"]])) ? 1 : 3}
                    value={value} onChange={(e) => { updateCount(row[0], e.target.value) }} />);
                break;
            case header_lookup["name"]:
                try {
                    return (
                        <OverlayTrigger placement="auto" trigger={['hover', 'focus']} overlay={
                            <Popover>
                                <Popover.Body>
                                    <Image style={{ maxWidth: "100%" }} src={getImg(row[getImgKeyHeaderIndex()])} />
                                </Popover.Body>
                            </Popover>
                        }>
                            <Container><Row><Col>{value}</Col></Row></Container>
                        </OverlayTrigger>
                    )
                } catch (e) {
                    console.log(e);
                    return errorText("Error loading name");
                }
                break;
            case header_lookup["effect"]:
                try {
                    if (value.charAt(0) === '"')
                        value = value.substring(1, value.length - 1);
                    value = value.replace(/<br\s*[\/]?>/gi, "\n");
                    value = reactStringReplace(value, '<<!mana>>', (match, i) => (<Image style={{ "maxHeight": "20px" }} src={mana} />));
                    value = reactStringReplace(value, '<<!gold>>', (match, i) => (<Image style={{ "maxHeight": "20px" }} src={gold} />));
                    value = reactStringReplace(value, '<<!target>>', (match, i) => (<Image style={{ "maxHeight": "20px" }} src={target} />));
                    value = reactStringReplace(value, '<<!right>>', (match, i) => (<Image style={{ "maxHeight": "20px" }} src={right} />));
                    value = reactStringReplace(value, '<<!left>>', (match, i) => (<Image style={{ "maxHeight": "20px" }} src={left} />));
                    value = reactStringReplace(value, /<b>(.*?)<\/b>/g, (match, i) => (<strong>{match}</strong>));
                    return value;
                } catch (e) {
                    console.log(e);
                    return errorText("Error reading this effect.");
                }
                break;
            case header_lookup["mana cost"]:
                try {
                    return <div className="numeric">{Array.from({ length: value }, (_, i) => <Image style={{ "maxHeight": "20px" }} src={mana} />)}</div>;
                } catch (e) {
                    console.log(e);
                    return errorText("Error");
                }
                break;
            case header_lookup["gold cost"]:
                try {
                    return (value > 0) ? <div className="numeric">{value}&nbsp;<Image style={{ "maxHeight": "20px" }} src={gold} /></div> : "";
                } catch (e) {
                    console.log(e);
                    return errorText("Error");
                }
                break;
            case header_lookup["power"]:
                try {
                    return (value > 0) ? <div className="numeric">{value}&nbsp;{String.fromCodePoint(0x2694)}</div> : "";
                } catch (e) {
                    console.log(e);
                    return errorText("Error");
                }
                break;
            case header_lookup["health"]:
                try { 
                    return (value > 0) ? <div className="numeric">{value}&nbsp;{String.fromCodePoint(0x1F6E1)}</div> : "";
                } catch (e) {
                    console.log(e);
                    return errorText("Error");
                }
                break;
            default:
                try {
                    return value;
                } catch (e) {
                    console.log(e);
                    return errorText("Error");
                }
        }

        function errorText(text) {
            return <p style={{ color: "red" }}>{text}</p>
        }

    }

    // Perform First Time Setup
    useEffect(() => {
        // load images
        let temp_img_dict = {};
        gallery.forEach((url) => {
            temp_img_dict[getImageKey(url)] = url;
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
                            <li>Use the filters to help find the cards you want to add in the table. Use ctrl-click to select multiple. Use the "Tag" faction filter to include your Tags regardless of faction.</li>
                            <li>Give your deck a name and save it as a CSV to edit it later or as a PNG to import it right into Tabletop Simulator!</li>
                            <li>Import into TTS using Objects - Components - Cards - Custom Deck with Width 10, Height 6, and Back is Hidden.  Remember to select the correct Number (of cards) as well.</li>
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
                                        {faction_list.map((value) => (<option value={value}>{value}</option>))}
                                    </Form.Select>
                                </Col>
                                <Col>
                                    <h4>Type</h4>
                                    <Form.Select id="type_list" multiple htmlSize={7} onClick={() => updateFilters(csv_data)}>
                                        {type_list.map((value) => (<option value={value}>{value}</option>))}
                                    </Form.Select>
                                </Col>
                                <Col>
                                    <h4>Tag</h4>
                                    <Form.Select id="tag_list" multiple htmlSize={7} onClick={() => updateFilters(csv_data)}>
                                        {tag_list.map((value) => (<option value={value}>{value}</option>))}
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
                                        {Array.from(Array(10).keys()).map((_, col) => (getImg(decklist[row * 10 + col]) != null) ?
                                            (
                                                <td><OverlayTrigger hidden placement="auto" overlay={
                                                    <Popover>
                                                        <Popover.Body>
                                                            <Image style={{ maxWidth: "100%" }} src={getImg(decklist[row * 10 + col])} />
                                                        </Popover.Body>
                                                    </Popover>
                                                }>
                                                    <Image style={{ maxWidth: "100%" }} src={getImg(decklist[row * 10 + col])} />
                                                </OverlayTrigger></td>
                                            )
                                            :
                                            (<td><Image style={{ maxWidth: "100%" }} src={spacer} /></td>)
                                        )}
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
                        {headers.map((value, index) => (<th key={index}>{value.replace(/\s/g, String.fromCharCode(160))}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {filtered_csv_data.map((row_value, index) => (
                        <tr>
                            {row_value.map((value, index2) => (<td key={index2}>{format_cell(value, index2, row_value)}</td>))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    )
}

export default App
