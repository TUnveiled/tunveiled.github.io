import { useState, useEffect } from 'react'
import React from 'react';
import { createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import 'bootstrap/dist/css/bootstrap.css';
import '/src/App.css';
import $ from 'jquery';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Stack from 'react-bootstrap/Stack';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import defaultCSV from '/AU_Card_Images/Card_Data.csv?url';
import spacer from '/spacer.png?url';
import mana from '/mana.png?url';
import gold from '/gold.png?url'
import target from '/target.png?url'
import left from '/left.png?url'
import right from '/right.png?url'
import reactStringReplace from 'react-string-replace';
import Card from '/src/Card.jsx'
import TooltipShell from '/src/TooltipShell.jsx'
import FlexFilter from './FlexFilter';
import FlexContainer from './FlexContainer';
import CardTableView from './CardTableView';
import CardGridView from './CardGridView';
import CustomCount from './CustomCount';
function App() {
    const [csv_data, setCsvData] = useState([[]]);
    const [filtered_csv_data, setFilteredCsvData] = useState([[]]);
    const [headers, setHeaders] = useState([]);
    const [img_dict, setImgDict] = useState({});
    const [data_dict, setDataDict] = useState({});
    const [decklist, setDecklist] = useState([]);
    const [header_lookup, setHeaderLookup] = useState({});
    const [faction_list, setFactionList] = useState([]);
    const [type_list, setTypeList] = useState([]);
    const [tag_list, setTagList] = useState([]);
    const [selected_factions, setSelectedFactions] = useState([]);
    const [selected_types, setSelectedTypes] = useState([]);
    const [selected_tags, setSelectedTags] = useState([]);
    const [current_version, setCurrentVersion] = useState(true);
    const [active_tab, setActiveTab] = useState(localStorage.getItem("tab") ?? "card");
    const gallery = Object.values(import.meta.glob('/AU_Card_Images/*.png', { eager: true, query: '?url', import: 'default' }));
    const inline_images = { "mana": mana, "gold": gold, "left": left, "right": right, "target": target };
    const theme = createTheme({
        components: {
            MuiUseMediaQuery: {
                defaultProps: {
                    noSsr: true,
                },
            },
        }
    });
    const breakpointMatches = [
        useMediaQuery('(min-width:576px'),
        useMediaQuery('(min-width:768px'),
        useMediaQuery('(min-width:992px'),
        useMediaQuery('(min-width:1200px'),
        useMediaQuery('(min-width:1400px'),
    ];
    const getBreakpointIndex = () => breakpointMatches.filter(a => a).length;
    const SUPPRESSED_WARNINGS = ['trigger limits the visibility of the overlay to just mouse users.', 'Each child in a list should have a unique'];
    const consoleError = console.error;
    console.error = function filterWarnings(msg, ...args) {
        if (!SUPPRESSED_WARNINGS.some((entry) => msg.includes(entry)) && !SUPPRESSED_WARNINGS.some((entry) => args.some((arg) => arg.includes != null && arg.includes(entry)))) {
            consoleError(msg, ...args);
        }
    };
    const getID = function (row, _header_lookup) {
        _header_lookup = _header_lookup ?? header_lookup;
        return row[_header_lookup["ID"]];
    }
    const getIDFromImg = function (src) {
        let filename = src.substring(src.lastIndexOf("/") + 1);
        let start = filename.indexOf("_") + 1;
        let end = start + filename.substring(start + 1).indexOf("_") + 1;
        return decodeURI(filename.substring(start, end));
    }
    const getImg = function (id) {
        return img_dict[(id ?? -1)
            //.replace(/[\(\)']/g, "") // remove parentheses
            //.normalize('NFD').replace(/[a-z][\u0300-\u036f]/g, '') // remove accented letters
        ];
    }

    // Controller Functions
    function updateCount(id, count) { // change the count associated with a specific card ID
        try {
            let temp_csv_data = csv_data.map((row, index) => row.map((value, index2) => (getID(row) == id && index2 == header_lookup["Count"]) ? count : value));
            let temp_data_dict = data_dict;
            temp_data_dict[id][header_lookup["Count"]] = count;
            setCsvData(temp_csv_data);
            setDataDict(temp_data_dict);
            setFilteredCsvData(filtered_csv_data.map((row, index) => row.map((value, index2) => (getID(row) == id && index2 == header_lookup["Count"]) ? count : value)));
            updateDecklist(temp_csv_data);
        } catch (e) {
            console.log(e);
            alert("Counting error")
        }
    }
    function downloadCSV() { // Convert decklist into CSV format and download
        try {
            let csvContent = "data:text/csv;charset=utf-8,"
                + headers.join(",") + "\n"
                + csv_data.map(e => e.join(",")).join("\n");
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
    function updateDecklist(data, _header_lookup) { // Create the decklist array
        try {
            _header_lookup = _header_lookup ?? header_lookup;
            let temp_decklist = [];
            data.forEach((row) => {
                for (let i = 0; i < row[_header_lookup["Count"]]; i++) {
                    temp_decklist.push(getID(row, _header_lookup));
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
            if (_data === null || _data === undefined) _data = csv_data;
            if (_data === undefined) return;
            setFilteredCsvData(_data.filter((row) => {
                let type_match = (selected_types == undefined || selected_types.includes(row[header_lookup["type"]]) || selected_types.length == 0);
                let faction_match = (selected_factions == undefined || selected_factions.includes(row[header_lookup["faction"]]) || selected_factions.length == 0);
                let tag_match = (selected_tags == undefined || selected_tags.length == 0 || Object.keys(header_lookup).filter(header => header.includes("tag")).some(header => selected_tags.includes(row[header_lookup[header]])));
                let tag_exception = (selected_factions.includes("Tag") && row[header_lookup["faction"]] != "Tag" && selected_tags != undefined && selected_tags.length > 0)

                return type_match && ((faction_match && tag_match) || (tag_exception && (faction_match || tag_match)));

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
            let id_included = allTextLines[0].includes("ID");
            let _headers = (id_included ? [] : ["ID"]).concat(allTextLines[0].split(','));
            let _header_lookup = Object.fromEntries(Object.entries(_headers).map(([key, value]) => [value, parseInt(key)]));
            let _data_dict = data_dict;

            if (Object.keys(header_lookup).length === 0 || !current_version) {
                var lines = [];
                // Create each row array
                for (var i = 1; i < allTextLines.length; i++) {
                    var data = allTextLines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                    if (data == null || data.length < 2) continue; // handle bad data
                    var tarr = [];
                    if (!id_included)
                        tarr.push(i - 1);
                    for (var j = 0; j < _headers.length - (id_included ? 0 : 1); j++) {
                        data[j] = data[j] ? data[j].replace(/(\s)/g, " ") : null;
                        tarr.push(data[j]);
                    }
                    lines.push(tarr);
                    _data_dict[getID(tarr, _header_lookup)] = tarr;
                }

                let _faction_list = [...new Set(lines.map((row) => row[_header_lookup["faction"]]))];
                let _type_list = [...new Set(lines.map((row) => row[_header_lookup["type"]]))];
                let _tag_list = [...new Set([].concat(Object.keys(_header_lookup).filter(header => header.includes("tag"))
                    .map(header => lines.map((row) => row[_header_lookup[header]]))).flat().filter(a => a != null))].sort();

                setHeaders(_headers);
                setHeaderLookup(_header_lookup);
                setFactionList(_faction_list);
                setDataDict(_data_dict);
                setTypeList(_type_list);
                setTagList(_tag_list);
                setCsvData(lines);
                updateFilters(lines);
                updateDecklist(lines, _header_lookup);
            } else {
                let _csv_data = csv_data;

                // Create each row array
                for (var i = 1; i < allTextLines.length; i++) {
                    var new_data = allTextLines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                    if (new_data == null || new_data.length < 2) continue; // handle bad data
                    var tarr = [];
                    if (!id_included)
                        tarr.push(i - 1);
                    for (var j = 0; j < _headers.length - 1; j++) {
                        if (new_data[j] != null)
                            tarr.push((new_data[j] ?? "").replace(/(\s)/g, " "));
                    }
                    if (_data_dict[getID(tarr, _header_lookup)])
                        _data_dict[getID(tarr, _header_lookup)][header_lookup["Count"]] = tarr[_header_lookup["Count"]];
                }

                for (let i = 0; i < _csv_data.length; i++) {
                    _csv_data[i] = _data_dict[getID(_csv_data[i])];
                }

                setDataDict(_data_dict);
                setCsvData(_csv_data);
                updateFilters(_csv_data);
                updateDecklist(_csv_data);
            }

        } catch (e) {
            console.log(e);
            alert("Error reading CSV");
        }
    }
    function choose_file(e) {
        let _file = e.target.files[0];
        let _form = e.target;
        const reader = new FileReader();
        reader.onload = (e2) => {
            load_csv(e2.target.result);
            $("#filename").val(_file.name.substring(0, _file.name.lastIndexOf(".")));
            _form.value = null;
        };
        reader.readAsText(_file);
    }
    function format_cell(value, index, row, whitespace) {
        whitespace = whitespace ?? String.fromCharCode(160);
        if (value == undefined)
            return "";
        switch (index) {
            case header_lookup["ID"]:
                return <div key={`id-${index}-${value}`} className="numeric">{value}</div>;
            case header_lookup["Count"]:
                return (<CustomCount
                    count={value}
                    updateCount={updateCount}
                    name={getID(row)}
                    max={(["Commander", "Structure"].includes(row[header_lookup["type"]])) ? 1 : 3}
                    inverted={getBreakpointIndex() < 4}
                />);
                break;
            case header_lookup["name"]:
                try {
                    return (
                        <TooltipShell
                            key={`trigger-${index}-${value}`}
                            body={<Image key={`popover.image-${index}-${value}`} style={{ maxWidth: "100%" }} src={getImg(getID(row))} />}
                            content={<div key={`name-${index}-${value}`} style={{ height: "100%", display: "flex", alignItems: "center" }}>{value.replace(/\s/g, whitespace)}</div>}
                        />
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
                    for (const [key, url] of Object.entries(inline_images)) {
                        let _i = 0;
                        value = reactStringReplace(value, new RegExp(`(<<!*${key}>>)`),
                            (match, i) => (<Image key={`effect-img-${index}-${key}-${_i++}`} style={{ "maxHeight": "20px" }} src={url} />));
                    }
                    let _i = 0;
                    value = reactStringReplace(value, /<b>(.*?)<\/b>/g, (match, i) => (<strong key={`strong-${index}-${_i++}`} >{match}</strong>));
                    return value;
                } catch (e) {
                    console.log(e);
                    return errorText("Error reading this effect.");
                }
                break;
            case header_lookup["mana cost"]:
                try {
                    if (value < 5) {
                        return <div key={`manadiv-${index}`} className="numeric" style={{ minWidth: "80px" }}>
                            {Array.from({ length: value }, (_, i) => (<Image key={`mana-${getID(row)}-${i}`} style={{ "maxHeight": "20px" }} src={mana} />))}
                        </div>;
                    }
                    else if (value < 9) {
                        let half_cost = Math.ceil(value / 2);
                        return (<>
                            {Array.from({ length: 2 }, (_, i) => (
                                <div key={`manadiv-${index}-${i}`} className="numeric" style={{ minWidth: "80px" }}>
                                    {
                                        Array.from({ length: i == 0 ? half_cost : value - half_cost }, (_, j) => <Image key={`mana-${getID(row)}-${j}`} style={{ "maxHeight": "20px" }} src={mana} />)
                                    }
                                </div>))}
                        </>);
                    }
                    else {
                        return <div key={`manadiv-${index}`} className="numeric">{value}&nbsp;<Image key={`mana-${index}-${value}`} style={{ "maxHeight": "20px" }} src={mana} /></div>
                    }

                } catch (e) {
                    console.log(e);
                    return errorText("Error");
                }
                break;
            case header_lookup["gold cost"]:
                try {
                    return (value > 0) ? <div key={`golddiv-${index}-${value}`} className="numeric">{value}&nbsp;<Image key={`goldimg-${index}-${value}`} style={{ "maxHeight": "20px" }} src={gold} /></div> : "";
                } catch (e) {
                    console.log(e);
                    return errorText("Error");
                }
                break;
            case header_lookup["power"]:
                try {
                    return (value > 0) ? <div className="numeric" key={`power-${index}-${value}`} >{value}&nbsp;{String.fromCodePoint(0x2694)}</div> : "";
                } catch (e) {
                    console.log(e);
                    return errorText("Error");
                }
                break;
            case header_lookup["health"]:
                try {
                    return (value > 0) ? <div className="numeric" key={`health-${index}-${value}`} >{value}&nbsp;{String.fromCodePoint(0x1F6E1)}</div> : "";
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
        if (Object.keys(data_dict).length === 0) {
            // load images
            let temp_img_dict = {};
            gallery.forEach((url) => {
                temp_img_dict[getIDFromImg(url)] = url;
            })
            setImgDict(temp_img_dict);

            // Load default Card Data
            $.ajax({
                type: "GET",
                url: defaultCSV,
                dataType: "text",
                success: load_csv
            });

        }
    }, []);

    // Set up filters
    useEffect(updateFilters, [selected_factions, selected_types, selected_tags]);

    // determine number of cards that can comfortably fit in a row
    let img_grid_row_size = Math.min(3 + Math.floor(4 / 3 * getBreakpointIndex()), 8);
    let preview_grid_row_size = Math.min(2 * getBreakpointIndex() + (getBreakpointIndex() < 3 ? 6 : 2), 10);

    return (
        <div style={{ padding: "2%" }}>
            <h1>AU Deckbuilder</h1>
            <hr className="hr" />
            <FlexContainer
                className="outerContainer"
                md={12}
                lg={[5, 7]}
                elements={[
                    (<>
                        <h2>Instructions</h2>
                        <ul>
                            <li key="1">Import a CSV or <a href="#table">scroll down to the table</a> to get started!</li>
                            <li key="2">Use the filters to help find the cards you want to add in the table. Hover over the filter titles for details.</li>
                            <li key="3">Give your deck a name and save it as a CSV to edit it later or as a PNG to import it right into Tabletop Simulator!</li>
                            <li key="4">Import into TTS using Objects - Components - Cards - Custom Deck with Width 10, Height 6, and Back is Hidden.  Remember to select the correct Number (of cards) as well.</li>
                        </ul>

                        <hr className="hr" />

                        <h2>Helpful Links</h2>
                        <FlexContainer
                            elements={[
                                (<Button variant="outline-info" className="linkbtn" size="lg" href="https://docs.google.com/document/d/1ugf1jPtwdqVR7T10WZrzN0rqWBDUZOmKxP2Rj-eh0O4/edit?usp=sharing" target="_blank">Game&nbsp;Rules</Button>),
                                (<Button variant="outline-info" className="linkbtn" size="lg" href="https://steamcommunity.com/sharedfiles/filedetails/?id=3252480722" target="_blank">Game&nbsp;Board</Button>),
                                (<Button variant="outline-info" className="linkbtn" size="lg" href={defaultCSV}>CSV&nbsp;Template</Button>)
                            ]}
                        />

                        <hr className="hr" />

                        <h2>Load CSV</h2>
                        <Stack direction="horizontal" gap={1}>
                            <div className="px-1" style={{ width: "100%" }}>
                                <Button variant="outline-primary" as="label" size="lg" style={{ width: "100%" }}>
                                    Choose&nbsp;File...
                                    <Form.Control id="file_input" size="lg" type="file" style={{ display: "none" }} accept=".csv"
                                        onChange={choose_file}
                                    />
                                </Button>
                            </div>
                            <div className="vr" />
                            <div className="px-1">
                                <TooltipShell placement="auto" header="Modify Card Details"
                                    body={(<>Keep this dark to update your deck to the latest version of AU!</>)}
                                    content={(
                                        <Button as="label" size="lg" variant="outline-warning" className="togglebtn" active={!current_version}>
                                            {(current_version ? "Update Deck" : "Don't Update").replace(/\s/g, String.fromCharCode(160))}
                                            <Form.Check id="currentversioncheckbox" size="lg" type="checkbox"
                                                checked={!current_version} style={{ display: "none" }}
                                                onChange={(e) => setCurrentVersion(!e.target.checked)}
                                            />
                                        </Button>
                                    )}
                                />
                            </div>
                        </Stack>

                        <hr className="hr" />
                        <TooltipShell placement="top-start" header="Filters"
                            body={(<>Use these to find cards that meet certain criteria.</>)}
                            content={(<h2>Filters</h2>)}
                        />
                        <FlexContainer className="filterContainer"
                            xl={4} lg={12} md={4} sm={4} xs={12}
                            elements={[
                                (<FlexFilter
                                    option_list={faction_list}
                                    selected_options={selected_factions}
                                    set_selected_options={setSelectedFactions}
                                    header_label="Faction"
                                    tooltip_placement="top-start"
                                    tooltip_header="Factions"
                                    tooltip_body={(
                                        <ul>
                                            <li>A deck can have up to two factions/tags.</li>
                                            <li>You can play any card that matches one of your factions/tags.</li>
                                            <li>Cards labelled "General" can be played in any deck.</li>
                                            <li>Cards labelled "Tag" can only be played if it matches one of your deck's tags.</li>
                                        </ul>
                                    )}
                                />),
                                (<FlexFilter
                                    option_list={type_list}
                                    selected_options={selected_types}
                                    set_selected_options={setSelectedTypes}
                                    header_label="Type"
                                    tooltip_placement="top"
                                    tooltip_header="Card Types"
                                    tooltip_body={(<>A deck has exactly 40 units/spells, 6 structures, and 3 commanders (unless a card states otherwise; e.g. Rule of Law).</>)}
                                />),
                                (<FlexFilter
                                    option_list={tag_list}
                                    selected_options={selected_tags}
                                    set_selected_options={setSelectedTags}
                                    header_label="Tags"
                                    tooltip_placement="top-end"
                                    tooltip_header="Tags"
                                    tooltip_body={(
                                        <ul>
                                            <li>A deck can have up to two factions/tags.</li>
                                            <li>You can play any card that matches one of your factions/tags.</li>
                                        </ul>
                                    )}
                                />)
                            ]}
                        />
                        <hr className="hr" />

                        <h2>Downloads</h2>
                        <ButtonGroup style={{ width: "100%" }}>
                            <FloatingLabel controlId="filename" label="File Name" style={{ width: "100%" }}>
                                <Form.Control placeholder="File Name" size="lg" type="text" />
                            </FloatingLabel>
                            <TooltipShell placement="top-end" header="Save as CSV"
                                body="Save as a CSV to load it back into this tool later!"
                                content={(<Button style={{ alignSelf: "stretch" }} variant="outline-primary" size="lg" onClick={downloadCSV}>CSV</Button>)}
                            />
                            <TooltipShell placement="top-end" header="PNG Export"
                                body="Export this as a PNG to import it into Tabletop Simulator!"
                                content={(<Button style={{ alignSelf: "stretch" }} variant="outline-primary" size="lg" onClick={downloadImage}>PNG</Button>)}
                            />
                        </ButtonGroup>
                    </>),
                    (<>
                        <h2>Preview</h2>
                        <CardGridView table_id="preview_table" maxCards={60} row_size={preview_grid_row_size} model={decklist} getID={getID}
                            data_dict={data_dict} size="sm" updateCount={updateCount} header_lookup={header_lookup} getImg={getImg}
                        />
                        <canvas id="final_output" width="7500" height="6300" hidden />
                    </>)
                ]}
            />
            <hr className="hr" />
            <Tabs
                id="table"
                defaultActiveKey={active_tab}
                className="mb-3"
                justify
                onSelect={(_ak) => {
                    setActiveTab(_ak);
                    localStorage.setItem("tab", _ak);
                }}
            >
                <Tab title="Card Images" eventKey="card">
                    <CardGridView
                        table_id="allcards_table"
                        model={filtered_csv_data}
                        row_size={img_grid_row_size}
                        header_lookup={header_lookup}
                        updateCount={updateCount}
                        getImg={getImg}
                        getID={getID}
                        size="lg"
                    />
                </Tab>
                <Tab title="Card Details" eventKey="table">
                    <CardTableView
                        filtered_csv_data={filtered_csv_data}
                        headers={headers}
                        header_lookup={header_lookup}
                        format_cell={format_cell}
                        breakpoint_index={getBreakpointIndex()}
                        getID={getID}
                    />
                </Tab>
            </Tabs>
        </div>
    )
}

export default App
