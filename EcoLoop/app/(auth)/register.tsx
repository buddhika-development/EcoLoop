// app/(auth)/register.tsx
import { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ImageBackground,
    Platform,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { registerWithProfile } from "@/src/services/profile";

// -------------------------------------------------------------
// ✅ Simple UI components
// -------------------------------------------------------------
const Field = ({ label, children, error }: { label?: string; children: React.ReactNode; error?: string }) => (
    <View className="mb-3">
        {label ? <Text className="text-gray-800 mb-1 font-semibold">{label}</Text> : null}
        {children}
        {error ? <Text className="text-red-500 mt-1 text-xs">{error}</Text> : null}
    </View>
);

const PrimaryButton = ({
    title,
    onPress,
    disabled = false,
}: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className={`rounded-xl py-3 ${disabled ? "bg-purple-300" : "bg-[#5D3FD3]"}`}
    >
        <Text className="text-white text-center font-semibold text-base">{title}</Text>
    </TouchableOpacity>
);

const GhostButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} className="rounded-xl py-3 border border-gray-400 bg-white">
        <Text className="text-center text-gray-700">{title}</Text>
    </TouchableOpacity>
);

const Dots = ({ step }: { step: 1 | 2 | 3 }) => (
    <View className="flex-row justify-center items-center my-3">
        {[1, 2, 3].map((i) => (
            <View
                key={i}
                style={{ width: i === step ? 20 : 10 }}
                className={`h-2 rounded-full mx-1 ${i <= step ? "bg-[#5D3FD3]" : "bg-gray-300"}`}
            />
        ))}
    </View>
);

// -------------------------------------------------------------
// ✅ Validation
// -------------------------------------------------------------
const nicRegex = /^(?:[0-9]{9}[vVxX]|[0-9]{12})$/;

const step1Schema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    nic: z.string().regex(nicRegex, "Enter a valid NIC"),
    phone: z.string().optional(),
    dob: z.string().optional(),
    gender: z.enum(["male", "female"]).optional(),
});

const step2Schema = z.object({
    line1: z.string().min(2, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    postalCode: z.string().min(2, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
});

const step3Schema = z
    .object({
        email: z.string().email("Enter a valid email"),
        password: z.string().min(6, "Minimum 6 characters"),
        confirm: z.string().min(6),
    })
    .refine((d) => d.password === d.confirm, {
        message: "Passwords do not match",
        path: ["confirm"],
    });

const fullSchema = step1Schema.and(step2Schema).and(step3Schema);
type FormValues = z.infer<typeof fullSchema>;

// -------------------------------------------------------------
// ✅ Main component
// -------------------------------------------------------------
export default function Register() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [showDOB, setShowDOB] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        trigger,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(fullSchema),
        defaultValues: {
            fullName: "",
            nic: "",
            phone: "",
            dob: "",
            gender: undefined,
            line1: "",
            line2: "",
            city: "",
            postalCode: "",
            country: "LK",
            email: "",
            password: "",
            confirm: "",
        },
    });

    // -------------------------------------------------------------
    // ✅ Step logic
    // -------------------------------------------------------------
    const validateStep = async () => {
        if (step === 1) return trigger(["fullName", "nic", "phone", "dob", "gender"]);
        if (step === 2) return trigger(["line1", "line2", "city", "postalCode", "country"]);
        return trigger(["email", "password", "confirm"]);
    };

    const onNext = async () => {
        const ok = await validateStep();
        if (ok) setStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
    };

    const onBack = () => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));

    const onCreate = handleSubmit(async (all) => {
        setLoading(true);
        try {
            await registerWithProfile(all.email, all.password, {
                fullName: all.fullName,
                nic: all.nic,
                phone: all.phone,
                dob: all.dob,
                gender: all.gender as "male" | "female" | undefined,
                address: {
                    line1: all.line1,
                    line2: all.line2 || undefined,
                    city: all.city,
                    postalCode: all.postalCode,
                    country: all.country,
                },
            });

            setLoading(false);
            Alert.alert("Account Created!", "Welcome to EcoLoop 🌿", [
                { text: "Continue", onPress: () => router.replace("/(auth)/login") },
            ]);
        } catch (e: any) {
            setLoading(false);
            Alert.alert("Registration Failed", e.message || "Something went wrong");
        }
    });

    // -------------------------------------------------------------
    // ✅ Date picker logic
    // -------------------------------------------------------------
    const onChangeDOB = (_: any, date?: Date) => {
        setShowDOB(false);
        if (date) {
            const s = date.toISOString().slice(0, 10);
            setValue("dob", s, { shouldValidate: true });
        }
    };

    // -------------------------------------------------------------
    // ✅ Steps
    // -------------------------------------------------------------
    const Step1 = (
        <View>
            <Field label="Full Name" error={errors.fullName?.message}>
                <Controller
                    control={control}
                    name="fullName"
                    render={({ field: { value, onChange } }) => (
                        <TextInput
                            className="bg-white rounded-xl px-4 py-3 border border-gray-300"
                            placeholder="Full Name"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />
            </Field>

            <Field label="NIC" error={errors.nic?.message}>
                <Controller
                    control={control}
                    name="nic"
                    render={({ field: { value, onChange } }) => (
                        <TextInput
                            className="bg-white rounded-xl px-4 py-3 border border-gray-300"
                            autoCapitalize="characters"
                            placeholder="NIC"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />
            </Field>

            <Field label="Phone Number" error={errors.phone?.message}>
                <Controller
                    control={control}
                    name="phone"
                    render={({ field: { value, onChange } }) => (
                        <TextInput
                            className="bg-white rounded-xl px-4 py-3 border border-gray-300"
                            placeholder="(+94...)"
                            keyboardType="phone-pad"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />
            </Field>

            <Field label="Date of Birth" error={errors.dob?.message}>
                <Controller
                    control={control}
                    name="dob"
                    render={({ field: { value } }) => (
                        <>
                            <TouchableOpacity
                                onPress={() => setShowDOB(true)}
                                className="bg-white rounded-xl px-4 py-3 border border-gray-300"
                            >
                                <Text className={`${value ? "text-black" : "text-gray-400"}`}>
                                    {value || "YYYY-MM-DD"}
                                </Text>
                            </TouchableOpacity>
                            {showDOB && (
                                <DateTimePicker
                                    mode="date"
                                    value={value ? new Date(value) : new Date(2000, 0, 1)}
                                    display={Platform.OS === "ios" ? "spinner" : "default"}
                                    onChange={onChangeDOB}
                                    maximumDate={new Date()}
                                />
                            )}
                        </>
                    )}
                />
            </Field>

            <Field label="Gender" error={errors.gender?.message}>
                <Controller
                    control={control}
                    name="gender"
                    render={({ field: { value, onChange } }) => (
                        <View className="bg-white rounded-xl border border-gray-300">
                            <Picker selectedValue={value} onValueChange={onChange}>
                                <Picker.Item label="Select..." value={undefined} />
                                <Picker.Item label="Male" value="male" />
                                <Picker.Item label="Female" value="female" />
                            </Picker>
                        </View>
                    )}
                />
            </Field>
        </View>
    );

    const Step2 = (
        <View>
            {["line1", "line2", "city", "postalCode"].map((field, i) => (
                <Field
                    key={field}
                    label={field === "line1" ? "Address Line 1" : field === "line2" ? "Address Line 2 (optional)" : field === "city" ? "City" : "Postal Code"}
                    error={(errors as any)[field]?.message}
                >
                    <Controller
                        control={control}
                        name={field as any}
                        render={({ field: { value, onChange } }) => (
                            <TextInput
                                className="bg-white rounded-xl px-4 py-3 border border-gray-300"
                                placeholder={field}
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </Field>
            ))}
        </View>
    );

    const Step3 = (
        <View>
            {["email", "password", "confirm"].map((field, i) => (
                <Field
                    key={field}
                    label={
                        field === "email" ? "Email" : field === "password" ? "Password" : "Confirm Password"
                    }
                    error={(errors as any)[field]?.message}
                >
                    <Controller
                        control={control}
                        name={field as any}
                        render={({ field: { value, onChange } }) => (
                            <TextInput
                                className="bg-white rounded-xl px-4 py-3 border border-gray-300"
                                placeholder={field}
                                autoCapitalize="none"
                                secureTextEntry={field !== "email"}
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </Field>
            ))}
        </View>
    );

    const Content = useMemo(() => {
        if (step === 1) return Step1;
        if (step === 2) return Step2;
        return Step3;
    }, [step, errors, showDOB]);

    // -------------------------------------------------------------
    // ✅ UI Layout
    // -------------------------------------------------------------
    return (
        <ImageBackground
            source={require("@/assets/backgroundDesign.png")}
            resizeMode="cover"
            className="flex-1 bg-gray-50"
        >
            <KeyboardAvoidingView behavior="padding" className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="px-5 pt-14">
                        {/* 🔹 Logo + phrase */}
                        <View className="items-center mb-5">
                            <Image
                                source={require("@/assets/logo.png")}
                                style={{ width: 70, height: 70 }}
                                resizeMode="contain"
                            />
                            <Text className="text-[#5D3FD3] text-2xl font-extrabold mt-1">
                                EcoLoop
                            </Text>
                            <Text className="text-gray-700 mt-2 font-medium text-center p-3">
                                Join EcoLoop — where sustainability meets simplicity

                            </Text>
                            <Dots step={step} />
                        </View>

                        {/* Form */}
                        {Content}

                        {/* Buttons */}
                        <View className="mt-6 flex-row gap-3 justify-center items-center">
                            {step > 1 && (
                                <View className="flex-1">
                                    <GhostButton title="Back" onPress={onBack} />
                                </View>
                            )}
                            <View className="flex-1">
                                {step < 3 ? (
                                    <PrimaryButton title="Next" onPress={onNext} />
                                ) : loading ? (
                                    <View className="bg-[#5D3FD3] rounded-xl py-3">
                                        <ActivityIndicator color="#fff" />
                                    </View>
                                ) : (
                                    <PrimaryButton title="Create Account" onPress={onCreate} />
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            className="mt-5 self-center"
                            onPress={() => router.push("/(auth)/login" as any)}
                        >
                            <Text className="text-[#5D3FD3] font-medium">
                                Already have an account? Login.
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}
