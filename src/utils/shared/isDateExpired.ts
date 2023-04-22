const IsDateExpired = (expirationDate: Date): boolean => {
    const now = new Date(Date.now());
    const expDate = new Date(expirationDate);
    return now > expDate;
}

export default IsDateExpired;