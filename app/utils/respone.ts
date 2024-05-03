const respone = (status_Code: number, data: any, message: string, res: any, showPagination = true) => {
    const responseObj: any = {
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
}

export default respone