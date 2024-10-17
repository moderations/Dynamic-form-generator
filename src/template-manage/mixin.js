// const cloneDeep = o => {
//     return o && typeof o == 'object' ? JSON.parse(JSON.stringify(o)) : o;
// }
import {cloneDeep} from 'lodash';
import Editor from './form-element-config/components/editor';

export default {
    props: {
        // 全部数据
        formTemplate: {
            type: Array,
            default() {
                return []
            }
        },
        selectedModuleIndex: [Number, String],
        selectedFormItemIndex: [Number, String]
    },

    components: {
        Editor
    },

    data() {
        return {
            isAdvancedMode: false,
            ruleValidator: '',
        }
    },

    computed: {
        // 可选表单参数名列表
        formDataKey() {
            const {formTemplate} = this;

            return formTemplate.reduce((arr, formModule) => {
                const {child = []} = formModule;

                arr.push(...child.filter(formItem => formItem.key).map(formItem => {
                    const {key, valueType, options} = formItem;
                    const o = {key, valueType};

                    if(valueType === 'array') {
                        o.options = cloneDeep(options);
                    }
                    return o;
                }))
                return arr;
            }, [])
        },
        // 可选表单参数名列表（排除当前编辑表单元素）
        otherFormDataKey() {
            const {formTemplate, selectedModuleIndex, selectedFormItemIndex} = this;

            return formTemplate.reduce((arr, formModule, index) => {
                const {child = []} = formModule;

                arr.push(...child.filter((formItem, idx) => (selectedModuleIndex != index || selectedFormItemIndex != idx) && formItem.key).map((formItem, idx) => {
                    const {key, valueType, options} = formItem;
                    const o = {key, valueType};

                    if(valueType === 'array') {
                        o.options = cloneDeep(options);
                    }
                    return o;
                }))
                return arr;
            }, [])
        },
    },

    methods: {
        checkDuplicated(arr, key) {
            if( key ) {
                const duplicatedValue = {};
                let i = 0, len = arr.length;
                for(; i<len; i++) {
                    if(duplicatedValue[arr[i][key]]) {
                        break;
                    } else {
                        duplicatedValue[arr[i][key]] = 1;
                    }
                }
                if(i <= len - 1) return true;
            }
            return false
        },

        onRuleValidatorBlur() {
            console.log(this.ruleValidator);
        }
    }
}