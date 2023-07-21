import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import PropTypes from "prop-types";
import testData from './assets/test.json';
import profileHeadersData from './assets/profile_headers.json';
import testCampaignData from './assets/testCampaignData.json';
import axios from 'axios';
import './App.css';
import { Ring } from '@uiball/loaders'

const DataContext = createContext(null);
const FileNameContext = createContext(null);

function App() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [endpointPayload, setEndpointPayload] = useState(null);
    const [fileNameList, setFileNameList] = useState([]);
    const [showSpinner, setShowSpinner] = useState(false);

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

    const onFileUpload = async () => {
        const formData = new FormData();
    
        for (let file of selectedFiles) {
          formData.append("files", file);
        }
    
        try {
          await axios.post("https://dc-onboardiq.preprod.zetaglobal.io/upload/", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }).then(data => setEndpointPayload(data));
          console.log("Files uploaded successfully!");
        } catch (error) {
          console.error("Error uploading files:", error);
        }
      };

    const selectedFileList = () => selectedFiles.map((file, i) => <div key={i}>{i+1}. {file.name}</div>)

    const CurrentFileView = () => {
        const [rowSelection, setRowSelection] = useState({});
        const [profiles, setProfiles] = useState(() => testData.profiles);
        const [emailList, setEmailList] = useState(() => testData.profiles.map(profile => profile.EMAIL_ADDRESS));
        const [campaignData, setCampaignData] = useState(() => {
            testCampaignData.forEach(event => event.properties = JSON.stringify(event.properties).replaceAll('\\', '').replaceAll(`"`, ''))
            return testCampaignData;
        })
        useEffect(() => {
            console.info('row selection -->', rowSelection);
            console.log(Object.keys(rowSelection)[0])
            console.log('email list', emailList);
            console.log('campaigndata-->', campaignData)
        }, [rowSelection])
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
        const eventTableColumns = [
            {
                accessorKey: 'email',
                header: 'Email'
            },
            {
                accessorKey: 'event_type',
                header: 'event_type',
            },
            {
                accessorKey: 'properties',
                header: 'Properties',
            }
        ]
        return (
            <>
            <div className='table-container'>
                <div className='profile-container'>
                    <div className='table'>
                        <h1>
                            Profiles
                        </h1>
                        <MaterialReactTable
                            columns={profileColumns}
                            data={testData.profiles}   
                            enableRowSelection
                            enableMultiRowSelection={false}
                            onRowSelectionChange={setRowSelection}
                            state={{ rowSelection }}
                            getRowId={(originalRow) => originalRow.userId}
                            />
                    </div>
                    <div className='table --headers'>
                        <h1>
                            Headers
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
                    <MaterialReactTable
                        columns={eventTableColumns}
                        data={campaignData}
                        initialState={{
                            showGlobalFilter: true, //show the global filter by default
                        }}
                        muiSearchTextFieldProps={{
                            id: 'search-events',
                            value: rowSelection ? emailList[Object.keys(rowSelection)[0]] : null,
                        }}
                    />
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
                />
            </TabPanel>)
        );
        
        return (
        <>
            <h3>Step 2: Check the data</h3>
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
            {showSpinner ? (<div>
            Uploading your file!
            <Ring 
            size={40}
            lineWeight={5}
            speed={2} 
            color="black"/>
            </div>) : null}
        <div className='file-tabs'>
            {endpointPayload ? <FileTabs/> : null}
        </div> 

        {endpointPayload ? <button>Push to ZMP</button> : null}
                    
        </FileNameContext.Provider>
        </DataContext.Provider>
        </>
    )
}

export default App
