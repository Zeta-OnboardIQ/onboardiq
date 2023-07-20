import { useState, useEffect, createContext, useContext, useMemo } from 'react'
import { MaterialReactTable } from 'material-react-table';
import testData from './assets/test.json'
import axios from 'axios';
import './App.css'

const DataContext = createContext(null);

function App() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [endpointPayload, setEndpointPayload] = useState(null);

    useEffect(() => {
        console.log('selectedFiles', selectedFiles, selectedFiles.length);
        console.log('endpointPayload', endpointPayload);
    }, [selectedFiles, endpointPayload])

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
        axios
            .get('https://pokeapi.co/api/v2/pokemon/ditto/')
            .then(response => {
                console.log('endpoint upload response -->', response.data)
                return response.data;
            })
            .then(data => setEndpointPayload(data))
    };

    const selectedFileList = () => selectedFiles.map((file, i) => <div key={i}>{i+1}. {file.name}</div>)

    const CurrentFileView = () => {
        // material-react-table expects an array of objects
        // const data = [useContext(DataContext)]
        // disable editing of all fields except for type
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
        // parse out sample data
        const [sampleData, setSampleData] = useState(() => testData.profiles);
        const [headerData, setHeaderData] = useState(() => testData.headers)
        
        const headerSet = new Set();
        headerData.forEach(item => headerSet.add(item.header))

        const handleSaveRow = async ({ exitEditingMode, row, values }) => {
            // throw error if type is not from header list
            if (!headerSet.has(values.type)) {
                return alert('Invalid entry.  Your selection must match an entity from the headers data list')
            }
            sampleData[row.index] = values;
            setSampleData([...sampleData]);
            exitEditingMode();
        };
        // parse out available headers
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
                        data={sampleData}
                        enableEditing
                        onEditingRowSave={handleSaveRow}    
                        />
                </div>
                <div className='table --headers'>
                    <h1>
                        Header Data
                    </h1>
                    <MaterialReactTable
                        columns={headerColumns}
                        data={headerData}
                        />
                </div>
            </div>
            </>
        )
    }

    return (
        <>
        <DataContext.Provider value={endpointPayload}>
        <h1>OnboardIQ</h1>

        {/* File Uploader */}
        <h3>Step 1: Upload your file(s)</h3>
        <div>
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

        {endpointPayload ? <CurrentFileView/> : null}
        </DataContext.Provider>
        </>
    )
}

export default App
