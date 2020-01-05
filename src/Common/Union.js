import {
	getUniIndex,
	udFun,
	createLog,
	isNvl
} from '../Utils';

udFun.emit = udFun;

let refreshRate = 40;

export function setRefreshRate(v) {
	refreshRate = v;
}

export function getRefreshRate(v) {
	return refreshRate;
}

export default class Union {
	constructor(param = {}) {
		const {
			devMode = false,
				devLog = udFun,
				errLog = udFun,
				emitter = udFun,
		} = param;

		this.devLog = devLog;
		this.errLog = errLog;

		this.emitter = emitter;
		this.devMode = devMode;
	}

	clone() {
		return new Union(this);
	}

	bindUnion(instance, logName) {
		if (this.devMode) {
			instance.devLog = this.devLog.createLog(logName);
		} else {
			instance.devLog = udFun;
		}

		instance.errLog = this.errLog.createLog(logName);
		instance.emitter = this.emitter;
		instance.devMode = this.devMode;
		instance.union = this;
	}
}
