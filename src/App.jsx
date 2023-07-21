import { useState, useEffect, createContext, useContext, useMemo } from 'react'
import { MaterialReactTable } from 'material-react-table';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import PropTypes from "prop-types";
import testData from './assets/test.json'
import profileHeadersData from './assets/profile_headers.json'
import axios from 'axios';
import './App.css'

const DataContext = createContext(null);
const FileNameContext = createContext(null);

function App() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [endpointPayload, setEndpointPayload] = useState(null);
    const [fileNameList, setFileNameList] = useState([]);

    useEffect(() => {
        console.log('selectedFiles', selectedFiles, selectedFiles.length);
        console.log('endpointPayload', endpointPayload);
        console.log('fileNames', fileNameList);
    }, [selectedFiles, endpointPayload, fileNameList])

    useEffect(() => {
        setFileNameList(selectedFiles.map(file => file.name))
    }, [selectedFiles])

    const onFileChange = event => {
        setSelectedFiles(Array.prototype.slice.call(event.target.files))
    };

    const onFileUpload = () => {
        const file = selectedFiles[0];
        const formData = new FormData();
        formData.append("file", file);
        axios
        .post("https://dc-onboardiq.preprod.zetaglobal.io/upload/", formData, {
            headers: {
            "Content-Type": "multipart/form-data",
            },
        })
        .then((response) => {
            // handle the response
            console.log('response-->', response);
        })
        .catch((error) => {
            // handle errors
            console.log(error);
        });
        // axios.post("https://dc-onboardiq.preprod.zetaglobal.io/upload/", {
        //     file: selectedFiles[0]})
        // .then(response => console.log('response from endpoint -->', response));

        // testing with a get request to the pokemon api
        // TODO: replace this with post request to 'upload/'
        // axios
        //     .get('https://pokeapi.co/api/v2/pokemon/ditto/')
        //     .then(response => {
        //         console.log('endpoint upload response -->', response.data)
        //         return response.data;
        //     })
        //     .then(data => setEndpointPayload(data))
        setEndpointPayload(testData)
    };

    const selectedFileList = () => selectedFiles.map((file, i) => <div key={i}>{i+1}. {file.name}</div>)

    const CurrentFileView = () => {
        const [profiles, setProfiles] = useState(() => testData.profiles);
        const profileColumns = [
            {
                accessorKey: 'EMAIL_ADDRESS',
                header: 'EMAIL_ADDRESS',
            },
            {
                accessorKey: 'FIRST_NAME',
                header: 'FIRST_NAME',
            },
            {
                accessorKey: 'LAST_NAME',
                header: 'LAST_NAME',
            },
            {
                accessorKey: 'ADDRESS_LINE_1',
                header: 'ADDRESS_LINE_1',
            },
            {
                accessorKey: 'ADDRESS_LINE_2',
                header: 'ADDRESS_LINE_2',
            },
            {
                accessorKey: 'CITY',
                header: 'CITY',
            },
            {
                accessorKey: 'STATE',
                header: 'STATE',
            },
            {
                accessorKey: 'ZIP',
                header: 'ZIP',
            },
        ];
        const profileHeaderColumns = [
            {
                accessorKey: 'header',
                header: 'profile_headers',
            },
        ];
        const eventTable = () => {
            const rows = [(<tr>
                <th>Key</th>
                <th>Value</th>
                <th>Does this belong in profile?</th>
              </tr>)];
            const eventProperties = testData.events[0].properties;
            for (const property in eventProperties) {
                rows.push(<tr>
                    <td>{property}</td>
                    <td>{eventProperties[property] ? eventProperties[property] : "null"}</td>
                    <td><input type="checkbox" id={property} name={property} value={eventProperties[property]}/></td>
                  </tr>)
            }
            return (
                <table>
                    {rows}
                </table>
            )
        }
        return (
            <>
            <div className='table-container'>
                <div>
                    <div className='table'>
                        <h1>
                            Profiles
                        </h1>
                        <MaterialReactTable
                            columns={profileColumns}
                            data={testData.profiles}   
                            />
                    </div>
                    <div className='table --headers'>
                        <h1>
                            Profile Headers
                        </h1>
                        <MaterialReactTable
                            columns={profileHeaderColumns}
                            data={profileHeadersData}
                            />
                    </div>
                </div>
                <div className='table'>
                    <h1>
                        Events
                    </h1>
                    {eventTable()}
                </div>
            </div>
            </>
        )
    }
    CurrentFileView.propTypes = {
        // sampleData: PropTypes.array.isRequired,
        // headerData: PropTypes.array.isRequired,
        // handleSaveRow: PropTypes.func.isRequired,
    }

    const FileTabs = () => {
        // const [sampleData, setSampleData] = useState(() => testData.profiles);
        // const [headerData] = useState(() => testData.headers);

        const tabNames = useContext(FileNameContext)
        // TODO: make sure that the data payloads in tabPanels appear in the same order as the FileNameContext list.
        const tabs = tabNames.map((name, i) => 
           (<Tab key={i}>{name}</Tab>)
        )
        const tabPanels = tabNames.map((name, i) => 
            (<TabPanel key={i}>
                <CurrentFileView
                // sampleData={sampleData}
                // headerData={headerData}
                />
            </TabPanel>)
        );
        
        return (
        <>
            <h3>Step 3: Correct and Teach the Model</h3>
            <Tabs>
                <TabList>
                {tabs}
                </TabList>
                {tabPanels}
            </Tabs>
        </>
        )
    }

    return (
        <>
        <DataContext.Provider value={endpointPayload}>
        <FileNameContext.Provider value={fileNameList}>

        <h1>OnboardIQ</h1>

        {/* File Uploader -- grr, this can't be in its own component or else this weird bug will appear https://stackoverflow.com/a/75883805 */}
        {!endpointPayload ? <>
        <h3>Step 1: Upload your file(s)</h3>
        <div className='file-uploader'>
            <input
                type="file"
                multiple
                onChange={onFileChange}
                />
            <button
                onClick={onFileUpload}
                disabled={!selectedFiles.length}
                >
                Upload
            </button>
            <h4>File List</h4>
            {selectedFiles.length ? selectedFileList() : <div>
                Select one or multiple files above for a list to appear!
                </div>}
        </div>
        </> : null}
        <div className='file-tabs'>
            {endpointPayload ? <FileTabs/> : null}
        </div> 
                    
        </FileNameContext.Provider>
        </DataContext.Provider>
        </>
    )
}

export default App
