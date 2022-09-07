import React, { forwardRef, useImperativeHandle, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import CircularIndeterminate from "Components/Main/Content/Progress/CircularIndeterminate";
import common from 'Common/common';
import hash from 'Common/hashing';
import useFetch from 'Common/axios';
import dayjs from "dayjs";
import 'Css/agGrid.scss';
import ModalPortal from "./Modal/ColumnModifyModal";
import ColumnModify from './ColumnModify'
import 'Css/modal.css';

const getDetailData = (fetchApi, reqData) => {
    return fetchApi.get('/api/users/contents/0201/detail', {
        params: {
            reqData : hash.cryptoEnc(JSON.stringify(reqData))
        }
    }, {})
        .then((res) => {
            return res;
        }).catch((err) => {
            common.apiVerify(err);
        })
}

const DetailData = forwardRef((props, ref) => {
    const [modalOpened, setModalOpened] = useState(false);
    const handleOpen = () => {
        setModalOpened(true);
    };

    const handleClose = () => {
        setModalOpened(false);
    };

    const gridRef = useRef(); // Optional - for accessing Grid's API
    const [progress, fetchApi] = useFetch();
    const [detailData, setDetailData] = useState([]);

    useImperativeHandle(ref, () => ({
        fetchApi: (postData) => {
            getDetailData(fetchApi, postData).then((res) => {
                setDetailData(res.data);
            })
        }
    }));
    let columnDefs = props.columns.filter(a => a.category === 'DETAIL');

    const defaultColDef = {
        resizable: true,
        sortable: true,
    };

    //더블클릭예제
    const onCellClicked = (params) => console.log(params.data.TERM_NM);

    const totalValueGetter = (params) => {
        if (params.data.TERM_NM === '합계') {
            return '합계'
        }
        return params.data.ROWNUM
    };

    const dataFormatter = (params) => {
        if (params.colDef.type === 'number') {
            return Math.floor(params.value)
                .toString()
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        } else if (params.colDef.type === 'date' && params.value) {
            return dayjs(params.value).format('YYYY-MM-DD');
        } else if (params.colDef.type === 'time') {
            let time = params.value;
            const hh = time.substr(0, 2);
            const mm = time.substr(2, 2);
            const ss = time.substr(4, 2);
            return hh + ':' + mm + ':' + ss;
        }
    };

    // * db에서 가져오는 컬럼 width값이 auto일 경우만 자동맞춤으로 사이즈 조절
    // * skipHeader가 true면 헤더의 텍스트 길이를 무시하고 사이즈 조절
    const autoSizeAll = useCallback((skipHeader) => {
        const allColumnIds = [];
        gridRef.current.columnApi.getColumns().forEach((column) => {
            {
                column.colDef.width === 'auto' &&
                    allColumnIds.push(column.getId());
            }
        });
        gridRef.current.columnApi.autoSizeColumn(allColumnIds, skipHeader);
    }, []);

    // *기본 컬럼 조건을 제외한 추가조건
    columnDefs = columnDefs.map((obj) => {
        if (obj.type === 'number') {
            columnDefs = {
                ...obj,
                valueFormatter: dataFormatter,
                cellClass: `${obj.align}_cell`
            }
        } else if (obj.type === 'date') { 
            columnDefs = {
                ...obj,
                valueFormatter: dataFormatter,
                cellClass: `${obj.align}_cell`
            }
        } else if (obj.type === 'time') { 
            columnDefs = {
                ...obj,
                valueFormatter: dataFormatter,
                cellClass: `${obj.align}_cell`
            }
        } else {
            columnDefs = {
                ...obj,
                cellClass: `${obj.align}_cell`
            }
        }
        return columnDefs
    })

    return (
        <>
            <div className='detail_form'>
                <div className='detail_title'>
                    <img alt='' />
                    <div>상세</div>
                </div>
                <div className='detail_column_sort' onClick={handleOpen}>
                    컬럼수정
                </div>
                {modalOpened && (
                    <ModalPortal closePortal={handleClose}>
                        <ColumnModify column={columnDefs} />
                    </ModalPortal>
                )}
            </div>
            <div className="ag-theme-custom"
                style={
                    props.visible === false ?
                        { height: 'calc(100vh - 400px)', width: '99%', position: 'relative' } :
                        { height: 'calc(100vh - 600px)', width: '99%', position: 'relative' }}>
                {progress === false ? <CircularIndeterminate /> : null}
                <AgGridReact
                    ref={gridRef}
                    rowData={detailData} 
                    columnDefs={columnDefs} 
                    defaultColDef={defaultColDef}
                    animateRows={true} 
                    onFirstDataRendered={() => autoSizeAll(false)}
                    suppressPropertyNamesCheck={true}
                    overlayNoRowsTemplate={
                        `<div
                            style={{
                        height: '100%',
                        width: '100%',
                        alignItems: "center",
                        justifyContent: "center",wjd
                        verticalAlgin:'center'
                    }}>
                        조회된 데이터가 없습니다.
                    </div>`
                    }
                // onCellClicked={onCellClicked}
                />
            </div>
        </>
    );
})

export default DetailData;