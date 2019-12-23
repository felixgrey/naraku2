import {
	getUniIndex,
	createLog,
	snapshot,
	udFun,
	sameFun,
	isNvl,
	showLog
} from './../Utils';

import Fetcher from './Fetcher';

export default class PaginationManager {

	constructor(dh, pgCfg) {
		this._key = getUniIndex();
		this._destroyed = false;

		this._fetchInfo = '';
		this._pgCfg = pgCfg;

		this._emitter = dh._emitter;
		// this._eternalData =  dh._eternalData;
		this._controller = dh._controller;

		const {
			fetcher,
			count = 0,
			startPage = 1,
			currentPage = 1,
			pageSize = 10
		} = pgCfg;
		
		if (!isNvl(fetcher)) {
			this._fetcher = fetcher;
			// this._eternalData.push
		}

		

		this._count = count;
		this._startPage = startPage;
		this._currentPage = currentPage;
		this._pageSize = pageSize;

		this.devLog = udFun;
		this.errLog = udFun;
	}

	checkUpdate(data, dataInfo) {
		const fetchInfo = {
			data: snapshot(data),
			dataInfo: snapshot(dataInfo),
		};

		this._fetchInfo = fetchInfo;
	}

	setDataCount(count) {
		this._count = count;
	}


	fetch() {
		// name, data = null, dataInfo = {}, paginationManager = null, stopKey = null
		// TODO
	}

	changePage(page) {
		this._currentPage = page;
	}

	changePageSize(pageSize) {
		this._pageSize = pageSize;
	}

	getPaginationInfo() {
		return {
			isPagination: false,
			startPage: this._startPage,
			currentPage: this._currentPage
		};
	}

	destroy() {
		if (this._destroyed) {
			return;
		}

		this._destroyed = false;

		this._controller = null;
	}
}
