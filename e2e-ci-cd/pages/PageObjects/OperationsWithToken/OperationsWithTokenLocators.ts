const tab_deposit = '//span[text()="Deposit"]';
const tab_transfer = '//span[text()="Transfer"]';
const tab_withdraw = '//span[text()="Withdraw"]';
const tab_history = '//span[text()="Activity"]';


const button_deposit = '//button[text()="Deposit"]';
const button_transfer = '//button[text()="Transfer"]';
const button_withdraw = '//button[text()="Withdraw"]';
const button_confirm = '//button[contains(text(), "Confirm")]';
const button_sign_in = '//button[text()="Sign in"]';

const enter_web3_address = '//input[@placeholder="Enter Sepolia address of receiver"]';
const input_amount_in_deposit_tab = '//span[text()="Deposit"]/ancestor::div//input[@placeholder="0"]';
const input_amount_in_transfer_tab = '//span[text()="Transfer"]/ancestor::div//input[@placeholder="0"]';
const input_amount_in_withdraw_tab = '//span[text()="Withdraw"]/ancestor::div//input[@placeholder="0"]';
const input_password = '//input[@placeholder="Password"]';
const enter_receiver_address = '//div//textarea[@placeholder="Enter address of zkTelos receiver"]';

const close_transaction_modal = '.close-modal-icon';
const add_current_wallet_address = '//span[contains(text(), "Add current wallet:")]';
export const OperationsWithTokenElementsLocators = {
    tab_deposit,
    close_transaction_modal,
    button_deposit,
    button_transfer,
    button_withdraw,
    tab_transfer,
    tab_withdraw,
    tab_history,
    enter_receiver_address,
    input_amount_in_deposit_tab,
    input_amount_in_transfer_tab,
    input_amount_in_withdraw_tab,
    enter_web3_address,
    button_confirm,
    input_password,
    button_sign_in,
    add_current_wallet_address
}

