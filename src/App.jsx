import { useState, useEffect, createContext, useContext, useMemo } from 'react'
import { MaterialReactTable } from 'material-react-table';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import PropTypes from "prop-types";
import testData from './assets/test.json'
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
        console.log('onfileupload fired')
        // const formData = new FormData();
        // formData.append(
        //     "myFile",
        //     selectedFiles,
        //     selectedFiles.name
        // );
        // axios.post("upload/", formData);

        // testing with a get request to the pokemon api
        // TODO: replace this with post request to 'upload/'
        axios
            .get('https://pokeapi.co/api/v2/pokemon/ditto/')
            .then(response => {
                console.log('endpoint upload response -->', response.data)
                return response.data;
            })
            .then(data => setEndpointPayload(data))
    };

    const selectedFileList = () => selectedFiles.map((file, i) => <div key={i}>{i+1}. {file.name}</div>)

    const CurrentFileView = props => {
        const sampleColumns = useMemo(() => [
            {
                accessorKey: 'entity',
                header: 'Entity',
                muiTableBodyCellEditTextFieldProps: {
                    disabled: true,
                },
            },
            {
                accessorKey: 'type',
                header: 'Type',
            },
            {
                accessorKey: 'confidence',
                header: 'Confidence',
                muiTableBodyCellEditTextFieldProps: {
                    disabled: true,
                },
            }
        ], []);
        const headerColumns = useMemo(() => [
            {
                accessorKey: 'header',
                header: 'Header',
            },
        ], []);
        return (
            <>
            <div className='table-container'>
                <div className='table'>
                    <h1>
                        Sample Data
                    </h1>
                    <MaterialReactTable
                        columns={sampleColumns}
                        data={props.sampleData}
                        enableEditing
                        onEditingRowSave={props.handleSaveRow}    
                        />
                </div>
                <div className='table --headers'>
                    <h1>
                        Header Data
                    </h1>
                    <MaterialReactTable
                        columns={headerColumns}
                        data={props.headerData}
                        />
                </div>
            </div>
            </>
        )
    }
    CurrentFileView.propTypes = {
        sampleData: PropTypes.array.isRequired,
        headerData: PropTypes.array.isRequired,
        handleSaveRow: PropTypes.func.isRequired,
    }

    const FileTabs = () => {
        const [sampleData, setSampleData] = useState(() => testData.profiles);
        const [headerData] = useState(() => testData.headers);
        
        const headerSet = new Set();
        headerData.forEach(item => headerSet.add(item.header))
        const handleSaveRow = async ({ exitEditingMode, row, values }) => {
            // throw error if type is not from header list
            if (!headerSet.has(values.type)) {
                return alert('Invalid entry.  Your selection must match a header from the Header Data list')
            }
            sampleData[row.index] = values;
            setSampleData([...sampleData]);
            // TODO: send request to update header in backend
            // axios.post('update_header_type/', {})
            exitEditingMode();
        };

        const tabNames = useContext(FileNameContext)
        // TODO: make sure that the data payloads in tabPanels appear in the same order as the FileNameContext list.
        const tabs = tabNames.map((name, i) => 
           (<Tab key={i}>{name}</Tab>)
        )
        const tabPanels = tabNames.map(() => 
            (<TabPanel>
                <CurrentFileView
                sampleData={sampleData}
                headerData={headerData}
                handleSaveRow={handleSaveRow}
                />
            </TabPanel>)
        );
        
        return (
        <Tabs>
            <TabList>
            {tabs}
            </TabList>
            {tabPanels}
        </Tabs>
        )
    }

    return (
        <>
        <DataContext.Provider value={endpointPayload}>
        <FileNameContext.Provider value={fileNameList}>

        <h1>OnboardIQ</h1>

        {/* File Uploader */}
        <h3>Step 1: Upload your file(s)</h3>
        <div className='file-uploader'>
            <input
                type="file"
                multiple
                onChange={onFileChange}
                />
            <button onClick={onFileUpload}>
                Upload
            </button>
            <h4>File List</h4>
            {selectedFiles.length ? selectedFileList() : <div>
                Select one or multiple files above for a list to appear!
                </div>}
        </div>
        <div className='file-tabs'>
            {endpointPayload ? <FileTabs/> : null}
        </div>
        </FileNameContext.Provider>
        </DataContext.Provider>
        </>
    )
}

export default App
