<template>
    <!-- 使用动态表单模板的页面，可复制当前页面再做定制化调整 -->
    <div class="GateCheckWrap">
        <div class="head-title">页面标题</div>
        <div class="contain">
            <el-form
                v-loading="loading"
                ref="formValidate"
                :model="formValidate"
                label-width="180px"
                label-position="left"
                size="small"
            >
                <template v-for="formModule in formTemplate">
                    <template v-if="isFormModuleVisible(formModule)">
                        <div
                            v-if="formModule.headerTitle"
                            :key="formModule.headerTitle"
                            class="title"
                        >
                            {{ formModule.headerTitle }}
                            <el-tooltip
                                v-if="formModule.desc"
                                placement="right-start"
                                :offset="-5"
                            >
                                <div
                                    slot="content"
                                    v-html="formModule.desc"
                                ></div>
                                <i class="el-icon-warning c-primary"></i>
                            </el-tooltip>
                        </div>
                        <el-form-item
                            v-for="formItem in formModule.child"
                            v-if="isFormItemVisible(formItem)"
                            :key="formItem.key"
                            :label="formItem.label"
                            :prop="formItem.key"
                            :rules="formItem.rules || []"
                        >
                            <template v-if="formItem.labelTip">
                                <span>
                                    {{formItem.label}}
                                    <el-tooltip v-if="formItem.labelTip" placement="right-start" :offset="-5">
                                        <div slot="content" v-html="formItem.labelTip"></div>
                                        <i class="el-icon-warning c-primary"></i>
                                    </el-tooltip>
                                </span>
                            </template>
                            <el-switch
                                v-if="formItem.elementTag === 'ISwitch'"
                                v-model="formValidate[formItem.key]"
                            ></el-switch>

                            <el-radio-group
                                v-if="formItem.elementTag === 'RadioGroup'"
                                v-model="formValidate[formItem.key]"
                                v-bind="formItem.attrs || {}"
                                class="radioButton"
                            >
                                <template
                                    v-if="
                                        formItem.attrs &&
                                        formItem.attrs.type == 'button'
                                    "
                                >
                                    <el-radio-button
                                        v-for="option in formItem.radioGroupOptions"
                                        :key="option.value"
                                        :label="option.value"
                                        >{{ option.label }}</el-radio-button
                                    >
                                </template>
                                <template v-else>
                                    <el-radio
                                        v-for="option in formItem.radioGroupOptions"
                                        :key="option.value"
                                        :label="option.value"
                                        >{{ option.label }}</el-radio
                                    >
                                </template>
                            </el-radio-group>

                            <el-checkbox-group
                                v-if="formItem.elementTag === 'CheckboxGroup'"
                                v-model="formValidate[formItem.key]"
                            >
                                <el-checkbox
                                    v-for="option in formItem.options"
                                    :key="option.value"
                                    :label="option.value"
                                    :disabled="option.disabled"
                                    >{{ option.label }}</el-checkbox
                                >
                            </el-checkbox-group>

                            <template
                                v-if="
                                    formItem.elementTag === 'Input' ||
                                    formItem.elementTag === 'InputNumber'
                                "
                            >
                                <em v-html="formItem.prefix"></em>
                                <el-input
                                    v-if="formItem.elementTag === 'Input'"
                                    v-model="formValidate[formItem.key]"
                                    v-bind="formItem.attrs || {}"
                                    :required="
                                        !!formItem.attrs &&
                                        !!formItem.attrs.required
                                    "
                                    class="inp"
                                >
                                </el-input>
                                <el-input-number
                                    v-if="formItem.elementTag === 'InputNumber'"
                                    v-bind="formItem.attrs || {}"
                                    controls-position="right"
                                    v-model="formValidate[formItem.key]"
                                >
                                </el-input-number>
                                <em v-html="formItem.suffix"></em>
                            </template>

                            <!-- 
                :remote="!!formItem.remote"
                :filterable="!!formItem.filterable"
                :clearable="!!formItem.clearable"
                :placeholder="formItem.placeholder" 
              -->
                            <el-select
                                v-if="
                                    formItem.elementTag === 'Select' &&
                                    !formItem.attrs.remote
                                "
                                class="inp"
                                popper-class="select-popper"
                                v-bind="formItem.attrs || {}"
                                v-model="formValidate[formItem.key]"
                                @change="onSelectChange($event, formItem, true)"
                            >
                                <el-option
                                    v-for="option in formItem.options"
                                    :value="option[formItem.valueKey]"
                                    :label="option[formItem.labelKey]"
                                    :key="option[formItem.valueKey]"
                                >
                                    <template v-if="formItem.customOption">
                                        <span class="select-popper--left">{{
                                            option[
                                                formItem.customOption.leftKey
                                            ]
                                        }}</span>
                                        <span class="select-popper--right"
                                            >[id:]
                                            {{
                                                option[
                                                    formItem.customOption
                                                        .rightKey
                                                ]
                                            }}</span
                                        >
                                    </template>
                                </el-option>
                            </el-select>
                            <el-select
                                v-if="formItem.elementTag === 'Select' && formItem.attrs.remote"
                                class="inp"
                                v-bind="formItem.attrs || {}"
                                v-model="formValidate[formItem.key]"
                                :remote-method="getRemoteMethod(formItem)"
                                :loading="formItem.loading"
                                @change="onSelectChange($event, formItem, true)"
                            >
                                <el-option
                                    v-for="option in formItem.options"
                                    :value="option[formItem.valueKey]"
                                    :label="option[formItem.labelKey]"
                                    :key="option[formItem.valueKey]"
                                >
                                    <template v-if="formItem.customOption">
                                        <span class="select-popper--left">{{
                                            option[
                                                formItem.customOption.leftKey
                                            ]
                                        }}</span>
                                        <span class="select-popper--right"
                                            >[id:]
                                            {{
                                                option[
                                                    formItem.customOption
                                                        .rightKey
                                                ]
                                            }}</span
                                        >
                                    </template>
                                </el-option>
                            </el-select>
                            <div v-if="formItem.desc" class="" v-html="formItem.desc"></div>
                        </el-form-item>
                    </template>
                </template>
                <el-form-item>
                    <el-button
                        type="primary"
                        @click="handleSubmit('formValidate')"
                        >保存配置</el-button
                    >
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
import "element-ui/lib/theme-chalk/index.css";
import Vue from "vue";
import { createNamespacedHelpers } from "vuex";
import { cloneDeep as simpleCloneDeep } from "lodash";
const { mapMutations, mapState, mapActions } =
    createNamespacedHelpers("machine");
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
// } from "element-ui";

// Vue.use(Loading.directive);
// Vue.prototype.$loading = Loading.service;

import { isObject } from "@utils/judge-type";
import request from "@/utils/request";
import {
    saveGateDeviceSetting,
} from "@api/machine";
import { getSettingFormTemplate } from "@/api/menu";
function debounce(fn, wait) {
    let timerId = null;
    return function debounced() {
        let context = this;
        let args = arguments;
        clearTimeout(timerId);
        timerId = setTimeout(function () {
            fn.apply(context, args);
        }, wait);
    };
}

export default {
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
    },
    data() {
        return {
            loading: false,
            formTemplate: [],
            formValidate: {},
        };
    },
    computed: {
        ...mapState(["deviceAllInfo", "deviceKey"]),

        isFormModuleVisible() {
            return (formModule) => {
                const { formValidate = {} } = this;
                const { visible } = formModule;

                if (visible === undefined || visible === true) return true;
                if (isObject(visible)) {
                    // {
                    //   judgeType: 'and', // judgeType取值：and 并 | or 或
                    //   conditions: [
                    //     {key: 'isOpenCloud', value: 1}
                    //   ]
                    // }
                    return recursionCheck(
                        visible,
                        simpleCloneDeep(formValidate)
                    );
                }

                return false;
            };
        },

        isFormItemVisible() {
            return (formItem) => {
                const { formValidate = {} } = this;
                const { visible } = formItem;

                if (visible === undefined || visible === true) return true;
                if (isObject(visible)) {
                    // {
                    //   judgeType: 'and', // judgeType取值：and 并 | or 或
                    //   conditions: [
                    //     {key: 'isOpenCloud', value: 1}
                    //   ]
                    // }
                    return recursionCheck(
                        visible,
                        simpleCloneDeep(formValidate)
                    );
                }

                return false;
            };
        },
    },
    watch: {
        // 全局store使用vuex-persistedstate持久化（即使用包括localstorage（但不限于）方式存储）导致刷新页面先使用持久化的store数据渲染一次，
        // 之后machine created又请求一次数据更新store，造成相同数据二次渲染，
        // 所以这边增加判断config数据stringify后对比 相同则跳过
        "deviceAllInfo.device_setting_info.sign_config": {
            async handler(newVal, oldVal) {
                console.log(
                    "watch deviceAllInfo",
                    newVal ? simpleCloneDeep(newVal) : newVal
                );
                if (
                    !newVal ||
                    !Object.keys(newVal).length ||
                    JSON.stringify(newVal) === JSON.stringify(oldVal)
                )
                    return;
                if (!this.formTemplate.length)
                    await this.getSettingFormTemplate();
                this.setData(newVal);
            },
            deep: true,
            immediate: true,
        },
    },

    async created() {},

    async mounted() {},
    methods: {
        ...mapActions(["getDeviceInfo"]),

        getSettingFormTemplate() {
            return new Promise(async (resolve, reject) => {
                this.loading = true;

                const res = await getSettingFormTemplate({ type: 1 }).catch(
                    (e) => e
                );

                this.loading = false;
                if (!res || res.code != 200) {
                    this.$message.error({
                        background: true,
                        message:
                            (res && (res.message || res.msg)) ||
                            "查询表单模板出错",
                    });
                    reject(
                        (res && (res.message || res.msg)) || "查询表单模板出错"
                    );
                    return;
                }
                if (!res.data || !res.data.length) {
                    this.$message.error({
                        background: true,
                        message: "表单模板无数据",
                    });
                    reject("表单模板无数据");
                    return;
                }
                this.$message.success({
                    background: true,
                    message: "查询表单模板成功",
                });
                this.formTemplate = res.data || [];
                resolve();
            });
        },

        async setData(sign_config) {
            this.loading = true;

            let formItem;

            if (sign_config) {
                this.formValidate = Object.assign(
                    {},
                    this.formValidate,
                    JSON.parse(JSON.stringify(sign_config))
                );

                const {
                    formTemplate,
                    formValidate,
                    converseType,
                    isFormItemVisible,
                } = this;

                formTemplate.forEach((module) => {
                    const { child } = module;

                    child.forEach((item) => {
                        const {
                            key,
                            valueType,
                            defaultValue,
                            elementTag,
                            attrs: { remote } = {},
                        } = item;

                        if (!isFormItemVisible(item)) {
                            // 不可见设置为默认值
                            this.$set(
                                this.formValidate,
                                key,
                                typeof defaultValue === "object"
                                    ? simpleCloneDeep(defaultValue)
                                    : defaultValue
                            );
                        } else {
                            if (formValidate[key] !== undefined) {
                                this.$set(
                                    this.formValidate,
                                    key,
                                    converseType(
                                        formValidate[key],
                                        valueType,
                                        item
                                    )
                                );
                            } else {
                                this.$set(
                                    this.formValidate,
                                    key,
                                    typeof defaultValue === "object"
                                        ? simpleCloneDeep(defaultValue)
                                        : defaultValue
                                ); // 复选框可选值有Array和string，如果是string，初始化需转换为数组，保存时需转为字符串
                            }

                            if (remote) {
                                const {
                                    remoteOptions: { initData = {} } = {},
                                } = item;
                                const initParams = Object.keys(initData).reduce(
                                    (o, key) => {
                                        const { isStatic, value } =
                                            initData[key];

                                        o[key] = isStatic
                                            ? value
                                            : formValidate[value] || "";
                                        return o;
                                    },
                                    {}
                                );

                                this.getRemoteMethod(
                                    item,
                                    initParams
                                )("").then((_) => {
                                    this.onSelectChange.apply(this, [
                                        formValidate[key],
                                        item,
                                    ]);
                                });
                            }
                        }
                    });
                });

                console.log("this.formValidate", this.formValidate);
                console.log("sign_config", sign_config);
            }
            this.loading = false;
        },

        getFormItemByKey(key) {
            let module = this.formTemplate.find((module) =>
                module.child.some((item) => item.key == key)
            );
            return module ? module.child.find((item) => item.key == key) : null;
        },

        converseType(val, type, formItem) {
            switch (type) {
                case "string":
                    return val + "";

                case "number":
                    return +val;

                case "boolean":
                    return !!val;

                case "array":
                    return Array.isArray(val) ? val : [];

                default:
                    return val;
            }
        },

        getRemoteMethod(formItem, params = {}) {
            // remoteOptions: {
            //   url: "/r/TerminalManage_DeviceManage/getLandListByApplyDid",
            //   method: 'post',
            //   keywordKey: 'key_word',
            //   data: {
            //     // 其他接口请求参数 <参数名>: {isStatic: true|false, value: isStatic为true则直接赋值，否则value为表单项的key，当前参数对应值为key对应表单项的值}
            //     apply_did: {isStatic: false, value: 'aid'},
            //   }
            // },
            const { formValidate, converseType } = this;
            const {
                remoteOptions: {
                    url = "",
                    method = "post",
                    keywordKey = "key_word",
                    data = {},
                } = {},
                valueKey,
                valueType,
            } = formItem;

            if (!url) {
                this.$message.error({
                    background: true,
                    message: "缺少接口地址",
                });
                return function () {};
            }

            return (query) => {
                return new Promise(async (resolve, reject) => {
                    console.log("getRemoteMethod", formItem.key, params, query);
                    if (Object.keys(params).length || query !== "") {
                        let enableRequest = true; // 是否发请求
                        const otherParams = Object.keys(data).reduce(
                            (o, key) => {
                                const { isStatic, value, required } = data[key];

                                o[key] = isStatic
                                    ? value
                                    : formValidate[value] || "";
                                if (!isStatic && !o[key] && required) {
                                    enableRequest = false;
                                }
                                return o;
                            },
                            {}
                        );

                        if (!enableRequest) return; // 如果请求参数中有动态参数且必填且值为空 则不发请求（发请求后端也是返回参数错误）

                        this.$set(formItem, "loading", true);

                        const res = await request({
                            url,
                            method,
                            data: {
                                [keywordKey]: query,
                                ...otherParams,
                                ...params,
                            },
                        }).catch((e) => e);

                        this.$set(formItem, "loading", false);
                        if (!res || res.code != 200)
                            return this.$message.error({
                                background: true,
                                message:
                                    (res && (res.message || res.msg)) ||
                                    `查询${formItem.label || ""}列表失败`,
                            });
                        this.$set(
                            formItem,
                            "options",
                            (res.data || []).map((item) => ({
                                ...item,
                                [valueKey]: converseType(
                                    item[valueKey],
                                    valueType
                                ),
                            }))
                        );
                    }
                    resolve();
                });
            };
        },

        // 下拉选择变更 遍历表单是否有依赖当前表单项的值的其他表单元素，有则触发对应动作，当前页面仅设计产品门票联动
        // emitByComponent 是否组件下拉选择触发，iview select下拉选择触发onchange会接着触发remote-method
        // 增加参数在remote-method处拦截 不发请求
        onSelectChange(val, formItem, emitByComponent = false) {
            const {
                formTemplate,
                formValidate,
                isFormModuleVisible,
                isFormItemVisible,
                converseType,
            } = this;
            const { key, events = {} } = formItem;
            console.log("onSelectChange", key);

            // if(emitByComponent) {
            //   this.$set(formItem, 'emitByOnChange', true);
            // }
            // 下拉选择点清空 会把值设置为undefined，保存后转json string会被丢弃 导致未对数据做置空操作
            // 所以这边做下适配，如果是undefined则设置为表单默认值
            if (val === undefined) {
                this.$set(this.formValidate, key, formItem.defaultValue);
            }
            // on-change更改目标表单元素对应的值 触发条件 非仅事件触发更改(SelectChange事件触发或者直接调用方法) 或者 事件触发时
            if (events["on-change"]) {
                events["on-change"].forEach((event) => {
                    const { target, value: valueKey, triggerByEvent } = event;
                    const _formItem = this.getFormItemByKey(target);
                    const o = formItem.options.find(
                        (i) => i[formItem.valueKey] == val
                    );

                    if (!triggerByEvent || emitByComponent) {
                        this.$set(
                            this.formValidate,
                            target,
                            converseType(
                                o
                                    ? o[valueKey]
                                    : (_formItem && _formItem.defaultValue) ||
                                          "",
                                _formItem.valueType
                            )
                        );
                    }
                });
            }

            formTemplate.forEach((module) => {
                if (!isFormModuleVisible(module)) return; // 模块不可见跳过

                const { child } = module;

                child.forEach(async (_formItem) => {
                    // 表单元素不可见
                    // 设置为默认值 并跳过
                    if (
                        !isFormItemVisible(_formItem) &&
                        (_formItem.setToDefaultWhenVisibleChange ===
                            undefined ||
                            _formItem.setToDefaultWhenVisibleChange)
                    ) {
                        this.$set(
                            formValidate,
                            _formItem.key,
                            typeof _formItem.defaultValue === "object"
                                ? simpleCloneDeep(_formItem.defaultValue)
                                : _formItem.defaultValue
                        );
                        return;
                    }

                    const { remoteOptions, valueKey, valueType } = _formItem;

                    if (!remoteOptions) return; // 不存在远程数据选项跳过

                    const {
                        url,
                        method,
                        keywordKey,
                        data = {},
                        listeners,
                    } = remoteOptions;

                    if (!listeners || !listeners.includes(key) || !url) return;

                    let enableRequest = true; // 是否发请求
                    const otherParams = Object.keys(data).reduce((o, key) => {
                        const { isStatic, value, required } = data[key];

                        o[key] = isStatic ? value : formValidate[value] || "";
                        if (!isStatic && !o[key] && required) {
                            enableRequest = false;
                        }
                        return o;
                    }, {});

                    if (!enableRequest) return; // 如果请求参数中有动态参数且必填且值为空 则不发请求（发请求后端也是返回参数错误）

                    // 选中值发生变化 有2种触发条件
                    // 1. 通过页面上操作的，把依赖当前表单元素的子元素重置为默认值
                    // 2. 通过直接调用change回调函数，这时候无需重置（通常是初始化时调用）
                    this.$set(_formItem, "loading", true);

                    const res = await request({
                        url,
                        method,
                        data: {
                            ...otherParams,
                        },
                    }).catch((e) => e);

                    this.$set(_formItem, "loading", false);
                    if (!res || res.code != 200) {
                        return this.$message.error({
                            background: true,
                            message:
                                (res && (res.message || res.msg)) ||
                                `查询${_formItem.label || ""}列表失败`,
                        });
                    }
                    if (!res.data || !res.data.length) {
                        this.$set(_formItem, "options", []);
                        this.$set(this.formValidate, _formItem.key, ""); // _formItem.defaultValue
                    } else {
                        this.$set(
                            _formItem,
                            "options",
                            (res.data || []).map((item) => ({
                                ...item,
                                [valueKey]: converseType(
                                    item[valueKey],
                                    valueType
                                ),
                            }))
                        );
                        emitByComponent &&
                            this.$set(this.formValidate, _formItem.key, ""); // _formItem.defaultValue
                    }
                });
            });
        },

        async saveGateDeviceSetting(sign_config) {
            let { deviceKey } = this;
            let setting = {
                device_key: deviceKey,
                setting: JSON.stringify({
                    sign_config,
                }),
            };
            let res = await saveGateDeviceSetting(setting).catch((e) => e);
            //   this.getDeviceInfo();
            if (res.code != 200) {
                if (res.code == 304) this.getDeviceInfo();
                return this.$Modal.error({
                    title: res.msg || res.message || JSON.stringify(res),
                });
            }
            // 保存成功 相关业务
        },

        handleSubmit(form) {
            this.$refs[form].validate((valid) => {
                if (!valid)
                    return this.$message.error({
                        background: true,
                        message: "表单填写有误，请修正后重新保存",
                    });

                this.saveGateDeviceSetting(this.getParams());
            });
        },

        getParams() {
            let {
                getFormItemByKey,
                formTemplate,
                isFormModuleVisible,
                isFormItemVisible,
            } = this;
            let formValidate = JSON.parse(JSON.stringify(this.formValidate));
            let formItem;

            // 遍历不可见表单元素，重置为默认值
            formTemplate.forEach((module) => {
                const { child } = module;

                child.forEach((_formItem) => {
                    // 表单元素不可见
                    // 设置为默认值 并跳过
                    if (
                        (!isFormItemVisible(_formItem) ||
                            !isFormModuleVisible(module)) && // 当前模块不可见 或 当前表单元素不可见
                        (_formItem.setToDefaultWhenVisibleChange ===
                            undefined ||
                            _formItem.setToDefaultWhenVisibleChange) // 当前表单元素setToDefaultWhenVisibleChange未设置或者为true
                    ) {
                        formValidate[_formItem.key] =
                            typeof _formItem.defaultValue === "object"
                                ? simpleCloneDeep(_formItem.defaultValue)
                                : _formItem.defaultValue;
                    }
                });
            });

            return formValidate;
        },
    },
};
/**
 *
 *   {
 *     judgeType: 'and', // judgeType取值：and 并 | or 或
 *     conditions: [
 *       {key: 'isOpenCloud', value: 1, relation: 'eq'}, // relation字典['eq']
 *       {judgeType, conditions: []},
 *     ]
 *   }
 */
function recursionCheck(o, context = {}) {
    const { judgeType, conditions = [], key, value, relation } = o;

    if (judgeType) {
        return judgeType == "and"
            ? conditions.every((item) => recursionCheck(item, context))
            : conditions.some((item) => recursionCheck(item, context));
    } else {
        return judgeBool(context, key, relation, value);
    }
}
function judgeBool(context, key, relation, value) {
    switch (relation) {
        case "==":
            return context[key] == value;

        case "!=":
            return context[key] != value;

        case ">":
            return context[key] > value;

        case ">=":
            return context[key] >= value;

        case "<":
            return context[key] < value;

        case "<=":
            return context[key] <= value;

        case "includes":
            return context[key].includes(value);

        case "notIncludes":
            return !context[key].includes(value);

        case "startsWith":
            return context[key].startsWith(value);

        case "endsWith":
            return context[key].endsWith(value);

        default:
            return context[key] == value;
    }
}
</script>
<style lang="scss">
@import "~@/vars.scss";

.c-primary {
    color: $colorPrimary;
}
.codeDialog {
    text-align: center;
    img {
        width: 100%;
    }
}
.marL20 {
    margin-left: 20px;
}
.GateCheckWrap {
    background: #fff;

    .button-box {
        border-top: 1px solid #e5e5e5;
        padding-top: 20px;
        margin-bottom: 20px;
    }
    .title {
        .ivu-icon-ios-alert {
            color: #2d8cf0;
        }
        font-size: 18px;
        line-height: 40px;
        padding: 10px;
        border-top: 1px solid #e5e5e5;
        &:nth-child(1) {
            border-top: none;
        }
    }
    //  .radioButton{
    .radioButton.ivu-radio-group-button .ivu-radio-wrapper-checked {
        background: #2d8cf0 !important;
        color: #fff !important;
    }
    // }
    .contain {
        padding: 20px 0;
        .el-form-item {
            margin-left: 20px;
        }
        .typeTip {
            display: inline-block;
            text-indent: 10px;
            line-height: 40px;
            width: 315px;
            height: 40px;
            background: inherit;
            background-color: rgba(244, 244, 245, 1);
            box-sizing: border-box;
            border-width: 1px;
            border-style: solid;
            border-color: rgba(230, 233, 240, 1);
            border-radius: 4px;
        }
        .inp {
            width: 400px;
        }
        .bor {
            width: 400px;
            box-sizing: border-box;
            border-radius: 5px;
            border: 1px solid #e5e5e5;
            padding: 10px;
            .s-inp {
                width: 50px;
            }
        }
    }
}
.select-popper {
    &--left {
        float: left;
        max-width: 400px;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    &--right {
        float: right;
    }
}
</style>
