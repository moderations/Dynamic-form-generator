<template>
    <el-form :model="configData" :rules="rules" ref="form" size="mini" label-width="100px" label-position="left" class="form-element-config form-element-config--select">
        <el-form-item label="模块标题" prop="headerTitle">
            <el-input v-model="configData.headerTitle" clearable></el-input>
        </el-form-item>
        <el-form-item label="模块描述" prop="desc">
            <!-- <el-input type="textarea" v-model="configData.desc" clearable @change="onDescChange"></el-input> -->
            <editor v-model="configData.desc" @change="onDescChange"></editor>
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

import mixin from '../mixin';
import JudgeData from './components/judge-data';
import {cloneDeep} from 'lodash';

// const cloneDeep = o => {
//     return o && typeof o == 'object' ? JSON.parse(JSON.stringify(o)) : o;
// }

export default {
    name: "FormModule",

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
        JudgeData,
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
        const headerTitleValidator = (rule, value, callback) => {
            if (this.configData.desc && !value) {
                return callback(new Error('已填写模块描述，请完善模块标题'));
            }
            callback();
        };
        return {
            rules: {
                headerTitle: [
                    {required: false, validator: headerTitleValidator, trigger: ['change', 'submit']}
                ],
                desc: [
                    {required: false}
                ],
            },
            visible: true,
            configData: {},
            judgeData: {
                judgeType: 'and', // judgeType取值：and 并 | or 或
                conditions: []
            },
        }
    },

    watch: {
        config: {
            handler(newVal, oldVal) {
                const {
                    headerTitle = '',
                    desc = '',
                    visible = true, 
                    child = []
                } = newVal;

                this.configData = {
                    headerTitle,
                    desc,
                    child
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
        onDescChange(val) {
            if( !val.trim() ) {
                this.$refs.form.clearValidate('headerTitle');
            }
        },

        onSave() {
            this.$refs.form.validate(async valid => {
                if(!valid) return;

                const errMsg = await this.validateOtherFormData().catch(e => e);
                console.log( errMsg );
                if(errMsg) return this.$message.error(errMsg);
                
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