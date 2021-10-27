export default class HandleTransactionResponse {
    isSuccess: boolean;
    title: string;
    message: string;
    isShowPositiveButton: boolean;
    positiveButton_text: string;
    positiveCallBack: () => void;
    isShowNegativeButton: boolean;
    negativeButton_text: string;
    negativeCallBack: () => void;
    where: string;

    public init(isSuccess, message, title?) {
        this.isSuccess = isSuccess;
        this.title = title ? title : isSuccess ? 'SUCCESS' : 'FAILURE';
        this.message = message;
        this.isShowPositiveButton = true;
        this.positiveButton_text = 'OK';
        this.isShowNegativeButton = false;
        this.negativeButton_text = 'CANCEL';
    }
}
