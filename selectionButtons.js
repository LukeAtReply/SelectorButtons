import { LightningElement, api } from 'lwc';
import { FlowNavigationNextEvent } from 'lightning/flowSupport';

export default class SelectionButtons extends LightningElement {
    @api input;
    @api textInput;
    @api outputValueSingle;
    @api outputValuesArray;
    @api maxSelection;
    @api navigateToNextScreen = false;
    @api isValid = false;
    @api minSelection;
    @api componentId;
    @api resetValues
    storageKey = '';
    errorMessage = '';
    maximumSelectionError = '';
    minimumSelectionError = '';
    unclickedButtonClass = 'slds-button slds-button_neutral';
    clickedButtonClass = 'slds-button slds-button_brand';
    buttonList;

    // Handles mouse events to show/hide the help text.
    handleHover(e) {
        const buttonIndex = this.buttonList.findIndex(button => button.id ===  e.target.dataset.buttonId);
        const _buttonList = [...this.buttonList];

        if (_buttonList[buttonIndex].helpText) {   
            _buttonList[buttonIndex].showTooltip = !_buttonList[buttonIndex].showTooltip;
            this.buttonList = _buttonList;
        }
    }
        
    // Handles button clicks and updates the selected values and the button's class
    handleClick(e) {
        const _buttonList = [...this.buttonList];
        const buttonIndex = _buttonList.findIndex(button => button.id ===  e.target.dataset.buttonId);
        let _selectedValues = this.outputValuesArray;

        //If already selected then remove from selected values and unselect button.
        if(_buttonList[buttonIndex].selected){
            const valueIndex = _selectedValues.findIndex((value) => value ===  _buttonList[buttonIndex].value)
            _selectedValues.splice(valueIndex, 1);
            _buttonList[buttonIndex].class = this.unclickedButtonClass;
            _buttonList[buttonIndex].selected = false;
            this.errorMessage = this.minimumSelectionError;
        } 
        else {
            // If only one is to be selected, unselect all other buttons. 
            if (this.maxSelection === 1) {
                _buttonList.forEach((button)=>{
                    _selectedValues = [];
                    button.selected = false;
                    button.class = this.unclickedButtonClass;
                })
            }

            //Checks if the max selection has been reached.
            if (this.maxSelection > _selectedValues.length) {
                console.log('under max');
                _selectedValues.push(_buttonList[buttonIndex].value);
                this.outputValueSingle = _buttonList[buttonIndex].value;
                _buttonList[buttonIndex].class = this.clickedButtonClass;
                _buttonList[buttonIndex].selected = true;
            }
            else{
                console.log('over max');
                this.errorMessage = this.maximumSelectionError;
            }
        }

        // this.input = JSON.stringify(_buttonList);
        sessionStorage.setItem(this.storageKey, JSON.stringify(_buttonList));

        this.isValid = this.minSelection === 0 || (_selectedValues.length >= this.minSelection && _selectedValues.length <= this.maxSelection) ? true : false;
        this.buttonList = _buttonList;
        this.outputValuesArray = _selectedValues;
        console.log(this.isValid);

        if (this.navigateToNextScreen && this.isValid) {
            const navigateNextEvent = new FlowNavigationNextEvent();
            setInterval(()=> this.dispatchEvent(navigateNextEvent), 150);
        }
    }

    // Sets up preselected buttons and sets unselected button classes
    connectedCallback(){
        console.log(this.maxSelection);
        let buttonList;
        let selectedValues = [];

        this.storageKey = `selectionButtons${this.componentId}`;
        console.log(this.storageKey);
        buttonList = sessionStorage.getItem(this.storageKey) && !this.resetValues ? JSON.parse(sessionStorage.getItem(this.storageKey)) : JSON.parse(this.input);

        // Format selection values and set errors.
        if (this.maxSelection == undefined || this.maxSelection === 0) {
            this.maxSelection = 1;
        }
        else{
            this.maximumSelectionError = `Only a maximum of ${this.maxSelection} options can be selected`;
        }

        if (this.minSelection == undefined || this.minSelection === 0) {
            this.minSelection = 0;
        }
        else{
            this.minimumSelectionError = this.minSelection === 1 ? this.minimumSelectionError = `Required` : `${this.minSelection} options are required`;
            this.errorMessage = this.minimumSelectionError;
        }
        
        buttonList.forEach((button) => {
            button.showTooltip = false;

            if (button.selected) {
                button.class = this.clickedButtonClass;
                selectedValues.push(button.value);
            }
            else{
                button.class = this.unclickedButtonClass;
            }
        })

        this.input = JSON.stringify(buttonList);
        this.buttonList = buttonList;
        this.outputValuesArray = selectedValues;
        this.isValid = this.minSelection === 0 || (selectedValues.length >= this.minSelection && selectedValues.length <= this.maxSelection) ? true : false;
    }
    
    @api validate(){
        return {
            isValid: this.isValid,
            errorMessage: `Please select an option`
        };
    }
}