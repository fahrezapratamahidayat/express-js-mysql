"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const respone = (status_Code, data, message, res, showPagination = true) => {
    const responseObj = {
        message,
        status_Code,
        data: data,
    };
    if (showPagination) {
        responseObj.pagination = {
            prev: "",
            next: "",
            total: "",
        };
    }
    res.status(status_Code).json(responseObj);
};
exports.default = respone;
