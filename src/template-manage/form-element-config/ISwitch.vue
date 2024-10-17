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
            <el-select v-model="configData.valueType" @change="onValueTypeChange" class="form-el-width-180">
                <el-option v-for="valueType in valueTypes" :key="valueType.value" :label="valueType.label" :value="valueType.value"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="默认值" prop="defaultValue">
            <el-select v-if="configData.valueType == 'boolean'" v-model="configData.defaultValue" class="form-el-width-180">
                <el-option label="true" :value="true"></el-option>
                <el-option label="false" :value="false"></el-option>
            </el-select>
            <el-input v-if="configData.valueType == 'string'" v-model="configData.defaultValue" class="form-el-width-180"></el-input>
            <el-input-number v-if="configData.valueType == 'number'" v-model="configData.defaultValue" class="form-el-width-180"></el-input-number>
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
        <el-form-item label="表单描述" prop="desc">
            <!-- TODO 使用富文本编辑器体验更佳 -->
            <!-- <el-input type="textarea" v-model="configData.desc" clearable></el-input> -->
            <editor v-model="configData.desc"></editor>
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
    name: "ISwitch",

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

    computed: {
        // 是否禁用新增选项列表 判断条件： 
        // 选中值数据类型未定义
        isAddOptionDisabled() {
            const {valueType} = this.configData;

            return !valueType;
        },
    },

    watch: {
        config: {
            handler(newVal, oldVal) {
                const {
                    visible = true, 
                    setToDefaultWhenVisibleChange = true
                } = newVal;

                this.configData = {
                    ...cloneDeep(newVal),
                    setToDefaultWhenVisibleChange
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
                    } = this;

                    const _configData = cloneDeep({
                        ...configData,
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
                const {visible} = this;

                if( visible == 2 ) {
                    const errMsg = this.$refs.visibleJudgeData.validate();

                    if(errMsg) {
                        reject(errMsg);
                        return;
                    }
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