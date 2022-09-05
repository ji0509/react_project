import React, { forwardRef, useImperativeHandle, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import CircularIndeterminate from "Components/Main/Content/Progress/CircularIndeterminate";
import common from 'Common/common';
import hash from 'Common/hashing';
import useFetch from 'Common/axios';
import dayjs from "dayjs";
import 'Css/agGrid.scss';

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

    const numberFormatter = (params) => {
        return Math.floor(params.value)
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    };

    const dateFormatter = (params) => {
        return dayjs(params.value).format('YYYY-MM-DD');
    };

    const timeFormatter = (params) => {
        return dayjs(params.value).format('HH:mm:ss');
    };

    const getRowStyle = params => {
        if (params.data.TERM_NM === '합계') {
            return {
                background: '#DAEFFD 0% 0% no-repeat padding-box',
                font: 'normal normal bold 14px/16px Pretendard',
                color: '#0885D7'
            };
        }
    };
    //field, 
    const onBtSaveOrderAndVisibilityState = useCallback(() => {
        const allState = gridRef.current.columnApi.getColumnState();
        const orderAndVisibilityState = allState.map((state) => ({
            field: state.colId,
            visible: state.hide,
        }));
        window.orderAndVisibilityState = orderAndVisibilityState;
    }, []);

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
                valueFormatter: numberFormatter,
                cellClass: `${obj.align}_cell`
            }
        } else if (obj.type === 'date') { 
            columnDefs = {
                ...obj,
                valueFormatter: dateFormatter,
                cellClass: `${obj.align}_cell`
            }
        } else if (obj.type === 'time') { 
            columnDefs = {
                ...obj,
                valueFormatter: timeFormatter,
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
                {/* <button onClick={onBtSaveOrderAndVisibilityState}>
                    순서저장
                </button> */}
            </div>
            <div className="ag-theme-custom"
                style={
                    props.visible === false ?
                        { height: '555px', width: '99%', position: 'relative' } :
                        { height: '355px', width: '99%', position: 'relative' }}>
                {progress === false ? <CircularIndeterminate /> : null}
                <AgGridReact
                    ref={gridRef}
                    rowData={detailData} 
                    columnDefs={columnDefs} 
                    defaultColDef={defaultColDef}
                    animateRows={true} 
                    getRowStyle={getRowStyle}
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