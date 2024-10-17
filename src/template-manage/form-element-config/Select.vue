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
            <!-- TODO 使用富文本编辑器体验更佳 -->
            <!-- <el-input type="textarea" v-model="configData.desc" clearable></el-input> -->
            <editor v-model="configData.desc"></editor>
        </el-form-item>
        <el-form-item label="占位符" prop="placeholder">
            <el-input v-model="configData.attrs.placeholder" class="form-el-width-180"></el-input>
        </el-form-item>
        <el-form-item label="是否远程搜索" prop="remote">
            <el-switch v-model="configData.attrs.remote" @change="onRemoteChange"></el-switch>
            <p class="c-info">对应el-select的remote配置项，远程搜索选项来源仅为接口获取</p>
        </el-form-item>
        <el-form-item label="是否可过滤">
            <el-switch v-model="configData.attrs.filterable"></el-switch>
        </el-form-item>
        <el-form-item label="是否可清空">
            <el-switch v-model="configData.attrs.clearable"></el-switch>
        </el-form-item>
        <el-form-item label="自定义下拉选项">
            <el-switch v-model="enableCustomOption" @change="onEnableCustomOptionChange"></el-switch>
        </el-form-item>
        <el-form-item label="下拉选项配置">
            <el-form-item label="label参数名" prop="labelKey">
                <el-input v-model="configData.labelKey" @change="onKeyChange($event, 'label')" clearable class="form-el-width-180"></el-input>
            </el-form-item>
            <el-form-item label="value参数名" prop="valueKey">
                <el-input v-model="configData.valueKey" @change="onKeyChange($event, 'value')" clearable class="form-el-width-180"></el-input>
            </el-form-item>
            <template v-if="enableCustomOption">
                <el-form-item label="左侧数据对应参数名" prop="customOption.leftKey">
                    <el-input v-model="configData.customOption.leftKey" @change="onKeyChange($event, 'left')" clearable class="form-el-width-180"></el-input>
                </el-form-item>
                <el-form-item label="右侧数据对应参数名" prop="customOption.rightKey">
                    <el-input v-model="configData.customOption.rightKey" @change="onKeyChange($event, 'right')" clearable class="form-el-width-180"></el-input>
                </el-form-item>
            </template>
            <el-form-item label="其他参数" prop="otherOptionKeys">
                <el-button @click="onAddOtherOptionKey" type="primary">新增</el-button>
                <div v-for="(optionKey,index) in configData.otherOptionKeys" :key="index" style="margin-top: 10px">
                    <el-input v-model="configData.otherOptionKeys[index]" @change="onOtherOptionKeyChange($event, index)" class="form-el-width-125"></el-input>
                    <i @click="configData.otherOptionKeys.splice(index, 1)" class="el-icon-error c-danger"></i>
                </div>
            </el-form-item>
        </el-form-item>
        <el-form-item label="选项来源">
            <el-radio-group v-model="optionSource" :disabled="configData.attrs.remote">
                <el-radio-button :label="0">静态数据</el-radio-button>
                <el-radio-button :label="1">接口获取</el-radio-button>
            </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!configData.attrs.remote && optionSource == 0" label="下拉选项" prop="options">
            <el-button :disabled="isAddOptionDisabled" @click="onAddOption" type="primary">新增</el-button>
            <template v-if="!isAddOptionDisabled">
                <div v-for="(option, index) in configData.options" :key="index" class="form-element-config--select-option" flex style="flex-wrap: wrap">
                    <template v-for="optionKey in optionKeys">
                        <template v-if="configData.valueKey && configData.valueKey == optionKey">
                            <el-select 
                                :key="optionKey"
                                v-if="configData.valueType == 'boolean'" 
                                v-model="option[configData.valueKey]" 
                                :placeholder="'请选择'+configData.valueKey" 
                                class="form-el-width-125">
                                <el-option label="true" :value="true"></el-option>
                                <el-option label="false" :value="false"></el-option>
                            </el-select>
                            <el-input 
                                :key="optionKey"
                                v-if="configData.valueType == 'string'" 
                                v-model="option[configData.valueKey]" 
                                :placeholder="'请输入'+configData.valueKey" 
                                class="form-el-width-125">
                            </el-input>
                            <el-input-number 
                                :key="optionKey"
                                v-if="configData.valueType == 'number'" 
                                v-model="option[configData.valueKey]" 
                                :placeholder="'请输入'+configData.valueKey" 
                                class="form-el-width-125">
                            </el-input-number>
                        </template>
                        <el-input 
                            v-else
                            :key="optionKey"
                            v-model="option[optionKey]" 
                            :placeholder="'请输入'+optionKey" 
                            clearable 
                            class="form-el-width-125">
                        </el-input>
                    </template>
                    <i @click="configData.options.splice(index, 1)" class="el-icon-error c-danger" style="margin-top: 9px"></i>
                </div>
            </template>
        </el-form-item>
        <el-form-item v-if="optionSource == 1" label="远程搜索配置"></el-form-item>
        <template v-if="optionSource == 1">
            <el-form-item label="远程接口地址" prop="remoteOptions.url">
                <el-input v-model="configData.remoteOptions.url" class="form-el-width-180"></el-input>
            </el-form-item>
            <el-form-item label="method" prop="remoteOptions.method">
                <el-select v-model="configData.remoteOptions.method" class="form-el-width-180">
                    <el-option label="post" value="post"></el-option>
                    <el-option label="get" value="get"></el-option>
                    <el-option label="delete" value="delete"></el-option>
                    <el-option label="head" value="head"></el-option>
                    <el-option label="options" value="options"></el-option>
                    <el-option label="put" value="put"></el-option>
                    <el-option label="patch" value="patch"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="configData.attrs.remote" label="关键字参数名" prop="remoteOptions.keywordKey">
                <el-input v-model="configData.remoteOptions.keywordKey" class="form-el-width-180"></el-input>
            </el-form-item>
            <el-form-item label="其他参数">
                <p class="c-info">同关键字参数一起发送至远程，参数名必须唯一</p>
                <el-button @click="onAddRemoteOptionsData" type="primary">新增</el-button>
                <div v-for="(item, index) in remoteOptionsData" :key="index" class="sub-form">
                    <el-form-item label="参数名" required>
                        <el-input v-model="item.name" class="form-el-width-125"></el-input>
                    </el-form-item>
                    <el-form-item label="静态数据">
                        <el-switch v-model="item.isStatic"></el-switch>
                    </el-form-item>
                    <el-form-item v-if="item.isStatic" label="值">
                        <el-input v-model="item.value" class="form-el-width-125"></el-input>
                    </el-form-item>
                    <el-form-item v-else label="表单key">
                        <el-select v-model="item.value" class="form-el-width-125" filterable>
                            <el-option v-for="keyItem in formDataKey" :key="keyItem.key" :label="keyItem.key" :value="keyItem.key"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="必填">
                        <el-switch v-model="item.required"></el-switch>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="danger" @click="remoteOptionsData.splice(index, 1)">删除</el-button>
                    </el-form-item>
                </div>
            </el-form-item>
            <el-form-item label="初始请求参数">
                <p class="c-info">页面加载主动请求接口初始化select额外参数，参数名必须唯一</p>
                <el-button @click="onAddRemoteOptionsInitData" type="primary">新增</el-button>
                <div v-for="(item, index) in remoteOptionsInitData" :key="index" class="sub-form">
                    <el-form-item label="参数名">
                        <el-input v-model="item.name" class="form-el-width-180"></el-input>
                    </el-form-item>
                    <el-form-item label="静态数据">
                        <el-switch v-model="item.isStatic"></el-switch>
                    </el-form-item>
                    <el-form-item v-if="item.isStatic" label="值">
                        <el-input v-model="item.value" class="form-el-width-180"></el-input>
                    </el-form-item>
                    <el-form-item v-else label="表单key">
                        <el-select v-model="item.value" filterable>
                            <el-option v-for="keyItem in formDataKey" :key="keyItem.key" :label="keyItem.key" :value="keyItem.key"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="danger" @click="remoteOptionsInitData.splice(index, 1)">删除</el-button>
                    </el-form-item>
                </div>
            </el-form-item>
            <el-form-item label="监听变化">
                <p>例：产品列表监听供应商变化，供应商选择发生变化，自动发请求更新当前下拉选项</p>
                <el-select v-model="configData.remoteOptions.listeners" collapse-tags multiple clearable filterable>
                    <el-option v-for="keyItem in formDataKey" :key="keyItem.key" :label="keyItem.key" :value="keyItem.key"></el-option>
                </el-select>
            </el-form-item>
        </template>
        <el-form-item label="事件列表">
            <el-button :disabled="events.length <= eventsData.length" @click="onAddEventsData" type="primary">新增</el-button>
            <p class="c-info">
                当前select组件事件订阅列表，触发组件事件，更新订阅列表参数为当前option的某个参数值，
                例：下拉option = {a:1,b:2,c:3}，订阅当前事件的表单参数名为lid，值参数为c，则事件触发，自动更改表单lid的值为option.c。
                特殊参数说明： 仅事件触发，事件对应方法可通过调用触发，也可通过当前下拉选项对应事件触发，配置当前选项用于限制当前下拉组件更改订阅对象的时机
            </p>
            <div v-for="(event, index) in eventsData" :key="index" class="sub-form">
                <el-form-item label="订阅事件名称">
                    <el-select v-model="event.name" class="form-el-width-125">
                        <el-option v-for="e in events" :key="e" :label="e" :value="e"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="订阅列表">
                    <el-button @click="onAddEventSubscriber(event)" type="primary">新增</el-button>
                    <template v-if="event.list">
                        <div v-for="(item, idx) in event.list" :key="idx" class="sub-form-inner">
                            <el-form-item label="仅事件触发">
                                <el-switch v-model="item.triggerByEvent"></el-switch>
                            </el-form-item>
                            <el-form-item label="表单key">
                                <el-select v-model="item.target" filterable class="form-el-width-125" required>
                                    <el-option v-for="keyItem in formDataKey" :key="keyItem.key" :label="keyItem.key" :value="keyItem.key"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="值对应key">
                                <el-select v-model="item.value" class="form-el-width-125" required>
                                    <el-option v-for="key in optionKeys" :key="key" :label="key" :value="key"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="danger" @click="event.list.splice(idx, 1)">删除</el-button>
                            </el-form-item>
                        </div>
                    </template>
                </el-form-item>
                <el-form-item label="">
                    <el-button type="danger" @click="eventsData.splice(index, 1)">删除</el-button>
                </el-form-item>
            </div>
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
    name: "Select",

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
        const otherOptionKeysValidator = (rule, value, callback) => {
            if (value && value.length && value.some(key => !key)) {
                return callback(new Error('请完善其他参数'));
            }
            callback();
        };
        const optionsValidator = (rule, value, callback) => {
            console.log('optionsValidator>>>', value);
            if (!value || !value.length) {
                return callback(new Error('选项来源为静态数据，下拉选项不能为空'));
            }

            const {valueKey} = this.configData;

            if( valueKey ) {
                if(value.some(o => o[valueKey] === '' || o[valueKey] === undefined)) {
                    return callback(new Error(`请输入${valueKey}`));
                }
                if(this.checkDuplicated(value, valueKey)) {
                    return callback(new Error(`${valueKey}值不能重复`))
                }
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
                labelKey: [
                    {required: true, message: '请输入下拉选项label参数名', trigger: ['blur', 'submit']}
                ],
                valueKey: [
                    {required: true, message: '请输入下拉选项value参数名', trigger: ['blur', 'submit']}
                ],
                'customOption.leftKey': [
                    {required: true, message: '请输入自定义下拉选项左侧数据对应参数名', trigger: ['blur', 'submit']}
                ],
                'customOption.rightKey': [
                    {required: true, message: '请输入自定义下拉选项右侧数据对应参数名', trigger: ['blur', 'submit']}
                ],
                otherOptionKeys: [
                    {required: false, validator: otherOptionKeysValidator, trigger: 'submit'}
                ],
                options: [
                    {validator: optionsValidator, trigger: 'submit'}
                ],
                'remoteOptions.url': [
                    {required: true, message: '请输入远程接口地址', trigger: ['blur', 'submit']}
                ],
                'remoteOptions.method': [
                    {required: true, message: '请选择远程接口method', trigger: ['change', 'submit']}
                ],
                'remoteOptions.keywordKey': [
                    {required: true, message: '请选择远程搜索关键字参数名', trigger: ['blur', 'submit']}
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
            enableCustomOption: false,
            optionSource: 0,
            remoteOptionsData: [],
            remoteOptionsInitData: [],
            events: ['on-change'], // TODO: 每个表单组件都有自身对应的事件列表 增加相应支持，事件列表在表单验证规则触发条件/订阅事件列表中都有使用
            eventsData: [],
        }
    },

    computed: {
        // 是否禁用新增下拉选项 判断条件： 
        // 无labelKey 且 无valueKey 且 （关闭自定义下拉选项或无leftKey且无rightKey）
        isAddOptionDisabled() {
            const {enableCustomOption} = this;
            const {labelKey, valueKey, customOption: {leftKey, rightKey} = {}} = this.configData;

            return !labelKey && !valueKey && (!enableCustomOption || !leftKey && !rightKey);
        },
        // 下拉选项参数名列表
        optionKeys() {
            const {enableCustomOption} = this;
            const {labelKey, valueKey, customOption: {leftKey, rightKey} = {}, otherOptionKeys = []} = this.configData;
            let keys = [];

            if( valueKey ) keys.push(valueKey);
            if( labelKey ) keys.push(labelKey);
            if(enableCustomOption && leftKey) keys.push(leftKey);
            if(enableCustomOption && rightKey) keys.push(rightKey);
            keys.push(...otherOptionKeys.filter(key => key));
            keys = [...new Set(keys)];
            return keys;
        }
    },

    watch: {
        config: {
            handler(newVal, oldVal) {
                const {
                    visible = true, 
                    rules = [], 
                    attrs = {}, 
                    options = [],
                    otherOptionKeys = [],
                    customOption = {},
                    remoteOptions = {},
                    events = {},
                    setToDefaultWhenVisibleChange = true
                } = newVal;
                let _otherOptionKeys = [...otherOptionKeys];
                const remoteOptionsData = remoteOptions.data || {};
                const remoteOptionsInitData = remoteOptions.initData || {};

                this.remoteOptionsData = Object.keys(remoteOptionsData).map(key => ({name: key, ...remoteOptionsData[key]}));
                this.remoteOptionsInitData = Object.keys(remoteOptionsInitData).map(key => ({name: key, ...remoteOptionsInitData[key]}));
                this.enableCustomOption = customOption && Object.keys(customOption).length ? true : false;
                this.optionSource = attrs.remote ? 1 : options.length ? 0 : 1;
                this.eventsData = Object.keys(events).map(key => ({name: key, list: cloneDeep(events[key])}));
                if( !attrs.remote && options.length ) {
                    const {labelKey, valueKey, customOption: {leftKey, rightKey} = {}} = newVal;
                    let keys = [];

                    if( valueKey ) keys.push(valueKey);
                    if( labelKey ) keys.push(labelKey);
                    if(this.enableCustomOption && leftKey) keys.push(leftKey);
                    if(this.enableCustomOption && rightKey) keys.push(rightKey);
                    keys = [...new Set(keys)];

                    _otherOptionKeys = Object.keys(options[0]).filter(key => !keys.includes(key));
                }
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
                    rules: _rules,
                    attrs: cloneDeep(attrs),
                    options: cloneDeep(options),
                    customOption: cloneDeep(customOption),
                    remoteOptions: cloneDeep(remoteOptions),
                    events: cloneDeep(events),
                    otherOptionKeys: _otherOptionKeys,
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
        onRemoteChange(bool) {
            if(bool) {
                this.optionSource = 1;
                this.$set(this.configData, 'options', []);
            }
        },
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
        onKeyChange(val, key) {
            const {isAddOptionDisabled, enableCustomOption, optionKeys} = this;

            if(isAddOptionDisabled) return;

            const {options = []} = this.configData;
            const _options = options.map(option => {
                return optionKeys.reduce((o, key) => {
                    o[key] = option[key];
                    return o;
                }, {})
            });

            this.$set(this.configData, 'options', _options);
        },
        onAddOption() {
            const {enableCustomOption, optionKeys} = this;
            const {labelKey, valueKey, customOption = {}} = this.configData;
            // const option = {};

            // if(labelKey) {
            //     option[labelKey] = '';
            // }
            // if(valueKey) {
            //     option[valueKey] = undefined;
            // }
            // if( enableCustomOption ) {
            //     if(customOption.leftKey) option[customOption.leftKey] = '';
            //     if(customOption.rightKey) option[customOption.rightKey] = '';
            // }
            this.configData.options.push(optionKeys.reduce((o, key) => {
                o[key] = key === valueKey ? undefined : '';
                return o;
            }, {}));
        },

        onAddRemoteOptionsData() {
            const data = {
                name: '',
                isStatic: true,
                value: '',
                required: true
            };

            this.remoteOptionsData.push(data);

        },

        onAddRemoteOptionsInitData() {
            const data = {
                name: '',
                isStatic: true,
                value: ''
            };

            this.remoteOptionsInitData.push(data);
        },

        onAddEventsData() {
            const data = {
                name: '',
                list: [
                    {
                        target: '',
                        value: '',
                        triggerByEvent: true,
                    }
                ]
            };

            this.eventsData.push(data);
        },

        onAddEventSubscriber(event) {
            let {list} = event;

            if( !list ) this.$set(event, 'list', []);
            
            event.list.push({
                target: '',
                value: '',
                triggerByEvent: true,
            });
        },

        onAddOtherOptionKey() {
            this.configData.otherOptionKeys.push('');
        },

        onEnableCustomOptionChange(bool) {
            if( bool ) {
                this.$set(this.configData, 'customOption', {
                    leftKey: '',
                    rightKey: ''
                })
            } else {
                this.$set(this.configData, 'customOption', {});
            }
        },
        
        onOtherOptionKeyChange(val, index) {
            const {enableCustomOption} = this;
            const {labelKey, valueKey, customOption: {leftKey, rightKey} = {}, otherOptionKeys = []} = this.configData;

            if(!val) return;
            if(
                val == labelKey ||
                val == valueKey || 
                enableCustomOption && (val == leftKey || val == rightKey) ||
                otherOptionKeys.some((key, idx) => key == val && index != idx)
            ) {
                this.$message.error('已存在同名下拉选项参数，请更换');
                this.$set(this.configData.otherOptionKeys, index, '');
            }
        },

        onOtherOptionKeyDelete(e, index) {
            this.configData.otherOptionKeys.splice(index, 1);
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
                        remoteOptionsData,
                        remoteOptionsInitData,
                        enableCustomOption,
                        optionSource,
                        eventsData,
                        configData,
                        ruleValidator,
                        isAdvancedMode
                    } = this;
                    const {options: _options, remoteOptions: _remoteOptions, ...otherConfigData} = configData;
                    const {data, initData, keywordKey, ...other} = configData.remoteOptions;
                    let remoteOptions,
                        options;
                        
                    if(optionSource == 1) {
                        remoteOptions = {
                            ...other,
                            keywordKey: configData.attrs.remote ? keywordKey : '',
                            data: remoteOptionsData.reduce((o, item) => {
                                const {name, ...other} = item;
                                
                                o[name] = {...other};
                                return o;
                            }, {}),
                            initData: remoteOptionsInitData.reduce((o, item) => {
                                const {name, ...other} = item;
                                
                                o[name] = {...other};
                                return o;
                            }, {}),
                        };
                    } else {
                        options = configData.options;
                    }
                    const _configData = cloneDeep({
                        ...otherConfigData,
                        rules: isAdvancedMode ? [{validator: ruleValidator, trigger: 'submit'}] : otherConfigData.rules,
                        options,
                        remoteOptions,
                        events: eventsData.reduce((o, item) => {
                            const {name, list} = item;
                            
                            o[name] = [...list];
                            return o;
                        }, {}),
                        customOption: enableCustomOption ? configData.customOption : undefined,
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
                    remoteOptionsData, 
                    remoteOptionsInitData, 
                    eventsData, 
                    checkDuplicated, 
                    visible, 
                    optionSource, 
                    configData, 
                    optionKeys,
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
                if( optionSource == 0 ) {
                    if( !configData.options || !configData.options.length ) {
                        reject('选项来源为静态数据 下拉选项不能为空');
                        return;
                    }
                    if( configData.options.some(option => optionKeys.some(key => option[key] === undefined || option[key] === '')) ) {
                        reject('请完善 下拉选项');
                        return;
                    }
                    if(checkDuplicated(configData.options, configData.valueKey)) {
                        reject(`下拉选项 ${configData.valueKey}值 必须唯一`);
                        return;
                    }
                }
                if(remoteOptionsData.some(o => !o.name || o.required && !o.value)) {
                    reject('请完善 远程搜索配置 其他参数必填项');
                    return;
                }
                if(checkDuplicated(remoteOptionsData, 'name')) {
                    reject('远程搜索配置 其他参数 参数名必须唯一');
                    return;
                }
                if(remoteOptionsInitData.some(o => !o.name || !o.value)) {
                    reject('请完善 远程搜索配置 初始请求参数对应值');
                    return;
                }
                if(checkDuplicated(remoteOptionsInitData, 'name')) {
                    reject('远程搜索配置 初始请求参数 参数名必须唯一');
                    return;
                }
                if(eventsData.some(o => !o.name || !o.list || !o.list.length)) {
                    reject('请完善 事件列表 订阅事件名称/订阅列表');
                    return;
                }
                if(checkDuplicated(eventsData, 'name')) {
                    reject('事件列表 订阅事件名称必须唯一');
                    return;
                }
                for(let i = 0, len = eventsData.length; i<len; i++) {
                    if(checkDuplicated(eventsData[i].list, 'target')) {
                        reject('事件列表 单个订阅事件的订阅列表表单key不允许重复');
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