<template>
        <draggable
            class="drag-area"
            tag="ul"
            :list="list"
            :group="{ name: 'g1', put: enablePut }"
            :move="onMove"
            :value="value"
            @input="emitter"
        >
        <!-- TODO:111 -->
                <template v-for="(formItem, index) in realValue">
                    <!-- index为模块索引 -->
                    <!--  && formItem.child.length -->
                    <div 
                        v-if="formItem && formItem.child" 
                        :key="index"
                        @click="onFormModuleClick($event, formItem, index)" 
                        class="drag-area--form-module"
                        :class="{selected: selectedModuleIndex === index && selectedFormItemIndex === undefined}">
                        <div 
                            v-if="formItem.headerTitle" 
                            :key="formItem.headerTitle" 
                            class="drag-area--form-module-title">
                            {{formItem.headerTitle}}
                            <el-tooltip v-if="formItem.desc" placement="right-start" :offset="-5">
                                <div slot="content" v-html="formItem.desc"></div>
                                <i class="el-icon-warning c-primary"></i>
                            </el-tooltip>
                        </div>
                        <!-- <p v-if="formItem.headerTitle">
                            selectedModuleIndex
                            {{selectedModuleIndex}}
                            selectedFormItemIndex
                            {{selectedFormItemIndex}}
                            index
                            {{index}}
                        </p> -->
                        <nested-draggable
                            :list="formItem.child"
                            :enable-put="isTaskEnablePut(formItem)"
                            :module-index="index"
                            :selected-module-index.sync="_selectedModuleIndex"
                            :selected-form-item-index.sync="_selectedFormItemIndex">
                        </nested-draggable>
                        <div class="" style="padding-top: 8px; text-align: center;">
                            <el-dropdown placement="bottom" @command="handleCommand($event, formItem, index)">
                                <el-button type="primary">
                                    <i class="el-icon-plus"></i>新增表单元素
                                </el-button>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item
                                        v-for="element in formTags"
                                        :key="element.value" 
                                        :command="element.value">
                                        {{element.label}}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                    </div>
                    <!-- index为模块内表单元素的索引 -->
                    <el-form-item 
                        v-else
                        :label="formItem.label" 
                        :key="index"
                        :class="{selected: selectedModuleIndex === moduleIndex && selectedFormItemIndex === index}"
                        @click.native.stop="onFormItemClick($event, formItem, index)"
                        >
                        <template v-if="formItem.labelTip">
                            <span slot="label">
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
                            :value="formValidate[formItem.key] || []"
                        >
                            <template
                                v-if="
                                    formItem.attrs &&
                                    formItem.attrs.type == 'button'
                                "
                            >
                                <el-checkbox-button
                                    v-for="option in formItem.options"
                                    :key="option.value"
                                    :label="option.value"
                                    :disabled="option.disabled">
                                    {{ option.label }}
                                </el-checkbox-button>
                            </template>
                            <template v-else>
                                <el-checkbox
                                    v-for="option in formItem.options"
                                    :key="option.value"
                                    :label="option.value"
                                    :disabled="option.disabled">
                                    {{ option.label }}
                                </el-checkbox>
                            </template>
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
                                        option[formItem.customOption.leftKey]
                                    }}</span>
                                    <span class="select-popper--right"
                                        >[id:]
                                        {{
                                            option[formItem.customOption.rightKey]
                                        }}</span
                                    >
                                </template>
                            </el-option>
                        </el-select>
                        <el-select
                            v-if="
                                formItem.elementTag === 'Select' &&
                                formItem.attrs.remote
                            "
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
                                        option[formItem.customOption.leftKey]
                                    }}</span>
                                    <span class="select-popper--right"
                                        >[id:]
                                        {{
                                            option[formItem.customOption.rightKey]
                                        }}</span
                                    >
                                </template>
                            </el-option>
                        </el-select>
                        <div v-if="formItem.desc" class="" v-html="formItem.desc"></div>
                    </el-form-item>
                </template>
            <!-- <li v-for="el in list" :key="el.headerTitle">
                <p>{{ el.headerTitle }}</p>
                <nested-draggable :list="el.child" :enable-put="isTaskEnablePut(el)" />
            </li> -->
        </draggable>
</template>
<script>
// TODO:222
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
import draggable from "vuedraggable";
import request from '@/utils/request';

// Vue.use(Loading.directive);
// Vue.prototype.$loading = Loading.service;

const isInnerNode = (currentTarget, parentSelector) => {
    const isClassName = parentSelector.startsWith('.');
    const reg = new RegExp(`\\b${parentSelector.substring(1)}\\b`);

    if( isClassName ) {
        return currentTarget && (reg.test(currentTarget.className) || isInnerNode(currentTarget.parentElement, parentSelector));
    } else {
        return currentTarget && (reg.test(currentTarget.id) || isInnerNode(currentTarget.parentElement, parentSelector));
    }
}

export default {
    name: "nested-draggable",

    components: {
        draggable,
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
    },

    inject: ['formTags'],

    props: {
        value: {
            required: false,
            type: Array,
            default: null
        },
        list: {
            required: false,
            type: Array,
            default:null
        },
        enablePut: {
            type: Boolean,
            default: true,
        },
        moduleIndex: {
            type: Number
        },
        selectedModuleIndex: Number,
        selectedFormItemIndex: Number
    },

    computed: {
        formValidate: {
            get() {
                return this.list.reduce((o, formModule) => {
                    formModule.child &&
                        formModule.child.forEach((formItem) => {
                            if(formItem.elementTag == 'CheckboxGroup') {
                                console.log(formItem.key, formItem.defaultValue);
                            }
                            o[formItem.key] = formItem.defaultValue;
                        });

                    return o;
                }, {});
            },
            set(val) {}
        },
        // this.value when input = v-model
        // this.list  when input != v-model
        realValue() {
            // console.log('computed realValue', this.value);
            return this.value ? this.value : this.list;
        },
        _selectedModuleIndex: {
            get() {
                return this.selectedModuleIndex
            },
            set(val) {
                this.$emit('update:selectedModuleIndex', val);
            }
        },
        _selectedFormItemIndex: {
            get() {
                return this.selectedFormItemIndex
            },
            set(val) {
                this.$emit('update:selectedFormItemIndex', val);
            }
        }
    },

    methods: {
        emitter(value) {
            this.$emit("input", value);
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
                    if (params && Object.keys(params).length || query !== "") {
                        // if( formItem['emitByOnChange'] ) { // 如果是组件下拉选择时触发的，则退出
                        //   this.$set(formItem, 'emitByOnChange', false);
                        //   return;
                        // }

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
        isTaskEnablePut(el) {
            return !el.elementTag;
        },
        //move回调方法
        onMove(e,originalEvent){ 
            console.log(e, originalEvent);
            console.log(e.relatedContext.element, e.draggedContext.element);
            //不允许停靠
            if (
                e.relatedContext.element && e.relatedContext.element.child && !e.draggedContext.element.child ||
                (!e.relatedContext.element || !e.relatedContext.element.child) && e.draggedContext.element.child
            ) return false;
            return true;
        },
        
        onFormModuleClick(e, formModule, index) {
            console.log(e, formModule, index);
            if(!isInnerNode(e.target, '.el-form-item')) {
                this.$emit('update:selectedModuleIndex', index);
                this.$emit('update:selectedFormItemIndex', undefined);
            }
        },

        onFormItemClick(e, formItem, index) {
            const {moduleIndex} = this;
            console.log(e, formItem, index, moduleIndex);
            this.$emit('update:selectedModuleIndex', moduleIndex);
            this.$emit('update:selectedFormItemIndex', index);
        },

        handleCommand(command, formModule, formModuleIndex) {
            console.log('click on item ' + command);
            this.$emit('add-form-element', {elementTag: command, formModule, formModuleIndex})
        }
    },
};
</script>
<style scoped lang="scss">
@import '~@/vars.scss';
.c-primary {
  color: $colorPrimary;
}
.drag-area {
    padding-left: 8px;
    padding-top: 8px;
    padding-right: 2px;
    padding-bottom: 2px;
    min-height: 50px;
    outline: 1px dashed;

    &--form-module {
        padding: 4px;
        border: 1px solid;
        // padding-bottom: 8px;

        &-title {
            font-size: 18px;
            line-height: 40px;
            padding: 10px;
            border-top: 1px solid #e5e5e5;
            &:nth-child(1) {
                border-top: none;
            }
        }
        &.selected {
            background-color: lighten($colorPrimary, 30%);
        }
        .el-form-item {
            &.selected {
                background-color: lighten($colorPrimary, 30%);
            }
        }
    }

    &--form-module + &--form-module {
        margin-top: 10px;
    }
}
.inp {
    width: 220px;
}
</style>