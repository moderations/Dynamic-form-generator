<template>
    <div class="judge-data">
        <div class="judge-data-type">
            <el-radio-group v-model="judgeData.judgeType" style="margin-right: 5px;">
                <el-radio-button label="and">逻辑与</el-radio-button>
                <el-radio-button label="or">逻辑或</el-radio-button>
            </el-radio-group>
            <el-button @click="addCondition" icon="el-icon-plus" type="text">子条件</el-button>
            <el-button @click="addSubRules" icon="el-icon-plus" type="text">子规则</el-button>
            <slot name="removeButton"></slot>
        </div>
        <div v-for="(condition, index) in judgeData.conditions" :key="index" class="judge-data-condition">
            <judge-data 
                v-if="condition.judgeType" 
                :form-data-key="formDataKey"
                :data="condition"
                @data-change="onDataChange($event, index)"
                class="">
                <el-button slot="removeButton" @click="removeSubRules(condition, index)" type="text" class="c-danger">删除</el-button>
            </judge-data>
            <div v-else flex="cross:center" class="">
                <el-select v-model="condition.key" filterable>
                    <el-option
                        v-for="item in formDataKey"
                        :key="item.key"
                        :label="item.key"
                        :value="item.key">
                    </el-option>
                </el-select>
                <el-select v-model="condition.relation" class="form-el-width-100">
                    <el-option
                        v-for="relation in getRelationsOnCondition(condition)"
                        :key="relation.value"
                        :label="relation.label"
                        :value="relation.value">
                    </el-option>
                </el-select>
                
                <el-select v-if="getValueTypeOfConditionKey(condition) == 'boolean'" v-model="condition.value">
                    <el-option label="true" :value="true"></el-option>
                    <el-option label="false" :value="false"></el-option>
                </el-select>
                <el-input v-if="getValueTypeOfConditionKey(condition) == 'string'" v-model="condition.value" class="form-el-width-100"></el-input>
                <el-input-number v-if="getValueTypeOfConditionKey(condition) == 'number'" v-model="condition.value"></el-input-number>
                <el-select v-if="getValueTypeOfConditionKey(condition) == 'array'" v-model="condition.value">
                    <el-option
                        v-for="option in getOptionsOnConditionKey(condition)"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value">
                        label:{{option.label}}/value:{{option.value}}
                    </el-option>
                </el-select>
                <i @click="removeCondition(condition, index)" class="el-icon-error c-danger"></i>
            </div>
        </div>
    </div>
</template>

<script>
// import "element-ui/lib/theme-chalk/index.css";
import Vue from "vue";
import {cloneDeep} from 'lodash';
// import {
//     Loading,
//     Form,
//     FormItem,
//     Input,
//     InputNumber,
//     Radio,
//     RadioGroup,
//     RadioButton,
//     Checkbox,
//     CheckboxButton,
//     CheckboxGroup,
//     Switch,
//     Select,
//     Option,
//     Button,
//     ButtonGroup,
//     Tooltip,
//     Dropdown,
//     DropdownMenu,
//     DropdownItem,
//     messageBox,
//     message,
// } from "element-ui";

// Vue.use(Loading.directive);
// Vue.prototype.$loading = Loading.service;

export default {
    name: 'judge-data',

    components: {
        // [Tooltip.name]: Tooltip,
        // [Form.name]: Form,
        // [FormItem.name]: FormItem,
        // [Input.name]: Input,
        // [InputNumber.name]: InputNumber,
        // [Radio.name]: Radio,
        // [RadioGroup.name]: RadioGroup,
        // [RadioButton.name]: RadioButton,
        // [Checkbox.name]: Checkbox,
        // [CheckboxButton.name]: CheckboxButton,
        // [CheckboxGroup.name]: CheckboxGroup,
        // [Switch.name]: Switch,
        // [Select.name]: Select,
        // [Option.name]: Option,
        // [Button.name]: Button,
        // [ButtonGroup.name]: ButtonGroup,
        // [Dropdown.name]: Dropdown,
        // [DropdownMenu.name]: DropdownMenu,
        // [DropdownItem.name]: DropdownItem,
        // [messageBox.name]: messageBox,
        // [message.name]: message,
    },

    props: {
        formTemplate: {
            type: Array,
            default() {
                return []
            }
        },
        formDataKey: {
            type: Array,
            default() {
                return []
            }
        },
        data: {
            type: Object,
            default() {
                return {
                    judgeType: 'and',
                    conditions: []
                }
            }
        }
    },

    data() {
        return {
            relations: [
                {label: '等于', value: '==', limitDataTypes: ['number', 'string', 'boolean']},
                {label: '不等于', value: '!=', limitDataTypes: ['number', 'string', 'boolean']},
                {label: '大于', value: '>', limitDataTypes: ['number']},
                {label: '大于等于', value: '>=', limitDataTypes: ['number']},
                {label: '小于', value: '<', limitDataTypes: ['number']},
                {label: '小于等于', value: '<=', limitDataTypes: ['number']},
                {label: '包含', value: 'includes', limitDataTypes: ['string', 'array']},
                {label: '不包含', value: 'notIncludes', limitDataTypes: ['string', 'array']},
                {label: '以***打头', value: 'startsWith', limitDataTypes: ['string']},
                {label: '以***结尾', value: 'endsWith', limitDataTypes: ['string']},
            ]
        }
    },

    computed: {
        judgeData: {
            get() {
                return this.data
            },
            set(val) {
                this.$emit('update:data', val);
                this.$emit('data-change', cloneDeep(val));
            }
        },
    },

    methods: {
        getRelationsOnCondition(condition = {}) {
            const {formDataKey, relations} = this;
            const {key} = condition;
            const formItem = formDataKey.find(item => item.key == key);

            if(!formItem) return [];
            return relations.filter(relation => relation.limitDataTypes.includes(formItem.valueType));
        },
        getValueTypeOfConditionKey(condition = {}) {
            const {formDataKey} = this;
            const {key} = condition;
            const formItem = formDataKey.find(item => item.key == key);

            if(!formItem) {
                this.$message.error('未知表单元素');
                return '';
            }
            return formItem.valueType
        },

        getOptionsOnConditionKey(condition = {}) {
            const {formDataKey} = this;
            const {key} = condition;
            const formItem = formDataKey.find(item => item.key == key);
            
            if(!formItem) {
                this.$message.error('未知表单元素');
                return [];
            }
            return formItem.options || [];
        },

        addCondition() {
            if(this.judgeData) {
                if(!this.judgeData.conditions) {
                    this.$set(this.judgeData, 'conditions', []);
                }
                this.judgeData.conditions.push({
                    key: this.formDataKey && this.formDataKey[0] ? this.formDataKey[0].key : '',
                    relation: '',
                    value: ''
                })
            }
        },

        addSubRules() {
            if(this.judgeData) {
                if(!this.judgeData.conditions) {
                    this.$set(this.judgeData, 'conditions', []);
                }
                this.judgeData.conditions.push({
                    judgeType: 'and',
                    conditions: []
                })
            }
            console.log(this.judgeData);
        },

        removeSubRules(condition, index) {
            this.judgeData.conditions.splice(index, 1);
        },

        removeCondition(condition, index) {
            this.judgeData.conditions.splice(index, 1);
        },

        validate() {
            const {judgeData} = this;
            let errMsg = '';

            if( judgeData && judgeData.conditions && judgeData.conditions.length ) {
                const loopValidate = (conditions = []) => {
                    let bool = true;
                    for(let i = 0, len = conditions.length; i < len; i++) {
                        if( conditions[i].judgeType ) {
                            if( !loopValidate(conditions[i].conditions) ) {
                                bool = false;
                                break;
                            }
                        } else {
                            const {key, relation, value} = conditions[i];

                            if( !key || !relation || value === undefined || value === null || value === '' ) {
                                bool = false;
                                break;
                            }
                        }
                    }
                    return bool;
                }
                if( !loopValidate(judgeData.conditions) ) {
                    errMsg = '是否可见 添加的子条件表单项均必填/添加的子规则至少添加一条子条件';
                }
            } else {
                errMsg = '至少增加一条子条件/子规则';
            }
            return errMsg;
        },

        onDataChange(data, index) {
            this.$set(this.judgeData.conditions, index, data);

        },
    },
}
</script>

<style lang="scss">
@import '~@/vars.scss';
.judge-data {
    margin-top: 10px;

    &-condition {
        margin-left: 10px;
        margin-top: 5px;
    }
    .el-button [class*=el-icon-]+span {
        margin-left: 0;
    }
}
</style>