<template>
    <el-form :model="configData" :rules="rules" ref="form" size="mini" label-width="100px" label-position="left" class="form-element-config form-element-config--select">
        <el-form-item label="表单标签文本" prop="label">
            <el-input v-model="configData.label" clearable class="form-el-width-180"></el-input>
        </el-form-item>
        <el-form-item label="表单气泡框" prop="labelTip">
            <editor v-model="configData.labelTip"></editor>
        </el-form-item>
        <el-form-item label="接口对应key" prop="key">
            <el-input v-model="configData.key" clearable class="form-el-width-180"></el-input>
        </el-form-item>
        <el-form-item label="数据类型" prop="valueType">
            <!-- inputnumber 类型为数值 不允许更改 -->
            <el-select v-model="configData.valueType" @change="onValueTypeChange" disabled class="form-el-width-180">
                <el-option v-for="valueType in valueTypes" :key="valueType.value" :label="valueType.label" :value="valueType.value"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="默认值" prop="defaultValue">
            <el-input-number v-model="configData.defaultValue" class="form-el-width-180"></el-input-number>
        </el-form-item>
        <el-form-item label="是否可见" prop="visible">
            <el-radio-group v-model="visible">
                <el-radio-button :label="1">可见</el-radio-button>
                <el-radio-button :label="0">不可见</el-radio-button>
                <el-radio-button :label="2">依赖其他表单项</el-radio-button>
            </el-radio-group>

            <judge-data
                v-if="visible == 2"
                ref="visibleJudgeData"
                :form-data-key="otherFormDataKey"
                :data.sync="judgeData">
            </judge-data>
        </el-form-item>
        <el-form-item label="重置为默认值" prop="setToDefaultWhenVisibleChange">
            <el-switch v-model="configData.setToDefaultWhenVisibleChange"></el-switch> 当表单元素不可见是否重置为默认值
        </el-form-item>
        <el-form-item label="表单校验规则" prop="rules">
            <!-- TODO: 增加高级模式 允许添加validator function -->
            <el-switch v-model="isAdvancedMode"></el-switch> 是否使用自定义函数校验
            <div v-if="isAdvancedMode" class="mt10">
                <el-input type="textarea" v-model="ruleValidator" :autosize="{ minRows: 4 }" @blur="onRuleValidatorBlur"></el-input>
            </div>
            <div v-else class="mt10">
                <el-button @click="onAddRule" type="primary">新增</el-button>
                <div v-for="(rule, index) in configData.rules" :key="index" class="mt10" flex="cross:center">
                    <div class="">
                        是否必填
                        <el-select v-model="rule.required" style="width: 60px">
                            <el-option label="是" :value="true"></el-option>
                            <el-option label="否" :value="false"></el-option>
                        </el-select>
                    </div>
                    <div class="">
                        错误信息
                        <el-input v-model="rule.message" clearable class="form-el-width-125"></el-input>
                    </div>
                    <i @click="configData.rules.splice(index, 1)" class="el-icon-error c-danger"></i>
                    <!-- <div class="">
                        触发方式
                        change
                    </div> -->
                </div>
            </div>
        </el-form-item>
        <el-form-item label="表单描述" prop="desc">
            <!-- <el-input type="textarea" v-model="configData.desc" clearable></el-input> -->
            <editor v-model="configData.desc"></editor>
        </el-form-item>
        <el-form-item label="占位符" prop="attrs.placeholder">
            <el-input v-model="configData.attrs.placeholder" clearable class="form-el-width-180"></el-input>
        </el-form-item>
        <el-form-item label="前置文本" prop="prefix">
            <el-input v-model="configData.prefix" clearable class="form-el-width-180"></el-input>
        </el-form-item>
        <el-form-item label="后置文本" prop="suffix">
            <el-input v-model="configData.suffix" clearable class="form-el-width-180"></el-input>
        </el-form-item>
        <el-form-item label="最小值" prop="attrs.min">
            <el-input-number v-model="configData.attrs.min" class="form-el-width-180"></el-input-number>
        </el-form-item>
        <el-form-item label="最大值" prop="attrs.max">
            <el-input-number v-model="configData.attrs.max" class="form-el-width-180"></el-input-number>
            <span class="c-info">请输入正常数值（无限大使用尽可能大的数值替代）</span>
        </el-form-item>
        <el-form-item label="步长" prop="attrs.step">
            <el-input-number v-model="configData.attrs.step" :min="0" class="form-el-width-180"></el-input-number>
        </el-form-item>
        <el-form-item label="数值精度" prop="attrs.precision">
            <el-input-number v-model="configData.attrs.precision" :min="0" class="form-el-width-180"></el-input-number>
        </el-form-item>
        <el-form-item label="显示控制按钮" prop="attrs.controls">
            <el-switch v-model="configData.attrs.controls"></el-switch>
        </el-form-item>

        <el-form-item>
            <el-button type="primary" @click="onSave">保存</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
import Vue from "vue";
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
// } from "element-ui";

// Vue.use(Loading.directive);
// Vue.prototype.$loading = Loading.service;

import JudgeData from './components/judge-data';
import mixin from '../mixin';
import {cloneDeep} from 'lodash';

// const cloneDeep = o => {
//     return o && typeof o == 'object' ? JSON.parse(JSON.stringify(o)) : o;
// }

export default {
    name: "InputNumber",

    mixins: [mixin],

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
        JudgeData
    },

    props: {
        // 模块配置数据
        config: {
            type: Object,
            default() {
                return {}
            }
        },
    },

    data() {
        const elementKeyValidator = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('接口对应key不能为空'));
            }
            if(this.otherFormDataKey.some(o => o.key == value)) {
                return callback(new Error('接口对应key已存在，请更改'));
            }
            callback();
        };
        const defaultValueValidator = (rule, value, callback) => {
            if (this.configData.setToDefaultWhenVisibleChange && value === undefined) {
                return callback(new Error('开启重置为默认值，需要配置默认值'));
            }
            callback();
        };
        const rulesValidator = (rule, value, callback) => {
            if (value && value.length && value.some(r => r.required && !r.message)) {
                return callback(new Error('请填写错误信息'));
            }
            callback();
        };
        const minValidator = (rule, value, callback) => {
            if (value && this.configData.attrs.max && value > this.configData.attrs.max) {
                return callback(new Error('最小值不能大于最大值'));
            }
            callback();
        };
        const maxValidator = (rule, value, callback) => {
            if (value && this.configData.attrs.min && value < this.configData.attrs.min) {
                return callback(new Error('最大值不能小于最小值'));
            }
            callback();
        };
        return {
            rules: {
                label: [
                    {required: false}
                ],
                key: [
                    {required: true, validator: elementKeyValidator, trigger: ['change', 'submit']}
                ],
                valueType: [
                    {required: true, message: '请选择数据类型', trigger: 'submit'}
                ],
                defaultValue: [
                    {validator: defaultValueValidator, trigger: ['change', 'submit']}
                ],
                rules: [
                    {required: false, validator: rulesValidator, trigger: 'submit'}
                ],
                'attrs.min': [
                    {validator: minValidator, trigger: 'submit'}
                ],
                'attrs.max': [
                    {validator: maxValidator, trigger: 'submit'}
                ],
            },
            visible: true,
            configData: {},
            judgeData: {
                judgeType: 'and', // judgeType取值：and 并 | or 或
                conditions: []
            },
            valueTypes: [
                {label: '字符串', value: 'string'},
                {label: '数字', value: 'number'},
                {label: '布尔', value: 'boolean'},
            ],
        }
    },

    computed: {},

    watch: {
        config: {
            handler(newVal, oldVal) {
                const {
                    visible = true, 
                    rules = [], 
                    attrs: {
                        placeholder = '',
                        min = 0,
                        max = 99999999,
                        step = 1,
                        precision = 0,
                        controls = true
                    } = {}, 
                    suffix = '',
                    prefix = '',
                    setToDefaultWhenVisibleChange = true
                } = newVal;

                let _rules = [];
                if(rules && rules.find(rule => rule.validator)) {
                    this.ruleValidator = rules.find(rule => rule.validator).validator;
                    this.isAdvancedMode = true;
                } else {
                    _rules = rules ? cloneDeep(rules) : [];
                    this.ruleValidator = '';
                    this.isAdvancedMode = false;
                }
                this.configData = {
                    ...cloneDeep(newVal),
                    setToDefaultWhenVisibleChange,
                    valueType: 'number',
                    rules: _rules,
                    suffix,
                    prefix,
                    attrs: {
                        placeholder,
                        min,
                        max,
                        step,
                        precision,
                        controls
                    },
                };
                if(typeof visible === 'boolean') {
                    this.visible = visible ? 1 : 0;
                } else {
                    this.visible = 2;
                    this.judgeData = cloneDeep(visible);
                }
            },
            deep: true,
            immediate: true
        }
    },

    created() {
        console.log(this.config);
        // this.configData = JSON.parse(JSON.stringify(this.config));
    },

    methods: {
        onValueTypeChange() {
            this.$set(this.configData, 'defaultValue', undefined);
        },

        onAddRule() {
            this.configData.rules.push({
                required: true,
                message: '',
                trigger: 'change'
            });
        },

        onSave() {
            return new Promise((resolve, reject) => {
                this.$refs.form.validate(async valid => {
                    if(!valid) {
                        reject('表单校验不通过');
                        return;
                    }

                    const errMsg = await this.validateOtherFormData().catch(e => e);

                    if(errMsg) {
                        reject(errMsg);
                        return;
                    }
                    
                    let {
                        visible, 
                        judgeData, 
                        configData,
                        ruleValidator,
                        isAdvancedMode
                    } = this;
                    const {attrs: _attrs, ...other} = configData;

                    const _configData = cloneDeep({
                        ...other,
                        rules: isAdvancedMode ? [{validator: ruleValidator, trigger: 'submit'}] : other.rules,
                        attrs: {
                            ..._attrs,
                            max: _attrs.max === Infinity ? 99999999 : _attrs.max
                        },
                        visible: visible != 2 ? !!visible : cloneDeep(judgeData)
                    });

                    this.$emit('update:config', _configData);
                    this.$emit('change', _configData);
                    resolve();
                })
            })
        },

        validateOtherFormData() {
            return new Promise((resolve, reject) => {
                const {
                    visible,
                    ruleValidator,
                    isAdvancedMode
                } = this;

                if( visible == 2 ) {
                    const errMsg = this.$refs.visibleJudgeData.validate();

                    if(errMsg) {
                        reject(errMsg);
                        return;
                    }
                }
                if( isAdvancedMode && !ruleValidator.trim() ) {
                    reject('表单校验规则 使用自定义函数校验 校验函数不能为空');
                    return;
                } 
                resolve();
            })
        },
    }
}
</script>

<style lang="scss">
@import '~@/vars.scss';

.form-element-config {
    &.form-element-config--select {
        
    }
    &--select-option {
        padding-top: 10px;
        .el-input {
            margin-right: 10px;
            margin-bottom: 10px;
        }
    }
    &--select-option + &--select-option {
        border-top: 1px dashed $borderColorLt;
    }
}
</style>